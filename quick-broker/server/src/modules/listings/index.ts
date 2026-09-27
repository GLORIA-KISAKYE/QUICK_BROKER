import { Router } from 'express';
import { z } from 'zod';
import { query } from '../../db';
import { authenticate, requireAdmin, AuthRequest } from '../../middleware/auth';
import { uploadPhoto, deletePhoto } from '../../utils/storage';
import { distanceFromKiu, bodaTime, walkTime } from '../../utils/distance';

const router = Router();

const createListingSchema = z.object({
  title: z.string().min(1),
  houseType: z.enum(['SINGLE_ROOM', 'DOUBLE_ROOM', 'SELF_CONTAINED_SINGLE', 'SELF_CONTAINED_DOUBLE', 'OTHER']),
  rentAmount: z.number().positive(),
  area: z.string().min(1),
  electricity: z.enum(['INCLUDED', 'SHARED_BILL', 'PERSONAL_BILL']).optional(),
  water: z.enum(['INCLUDED', 'SHARED_PAYMENT', 'STUDENT_PAYS', 'COMMUNITY_TAP']).optional(),
  kitchen: z.enum(['PRESENT', 'NOT_PRESENT']).optional(),
  bathroom: z.enum(['PRIVATE', 'SHARED']).optional(),
  toilet: z.enum(['PRIVATE', 'SHARED']).optional(),
  flooring: z.enum(['TILED', 'CEMENTED']).optional(),
  otherCharges: z.string().optional(),
  landlordPhone: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

// Public: list listings (preview)
router.get('/', async (req, res) => {
  try {
    const { area, minRent, maxRent, houseType, maxDistance, kitchen, bathroom, toilet, electricity, water, sort, page = '1', limit = '20' } = req.query;

    let sql = `SELECT id, title, house_type, rent_amount, area, distance_from_kiu, transport_time_boda, photos, status FROM listings WHERE status = 'AVAILABLE'`;
    const params: unknown[] = [];
    let paramCount = 0;

    if (area) {
      params.push(`%${area}%`);
      sql += ` AND area ILIKE $${++paramCount}`;
    }
    if (minRent) {
      params.push(Number(minRent));
      sql += ` AND rent_amount >= $${++paramCount}`;
    }
    if (maxRent) {
      params.push(Number(maxRent));
      sql += ` AND rent_amount <= $${++paramCount}`;
    }
    if (houseType) {
      params.push(houseType);
      sql += ` AND house_type = $${++paramCount}`;
    }
    if (maxDistance) {
      params.push(Number(maxDistance));
      sql += ` AND distance_from_kiu <= $${++paramCount}`;
    }
    if (kitchen) {
      params.push(kitchen);
      sql += ` AND kitchen = $${++paramCount}`;
    }
    if (bathroom) {
      params.push(bathroom);
      sql += ` AND bathroom = $${++paramCount}`;
    }
    if (toilet) {
      params.push(toilet);
      sql += ` AND toilet = $${++paramCount}`;
    }
    if (electricity) {
      params.push(electricity);
      sql += ` AND electricity = $${++paramCount}`;
    }
    if (water) {
      params.push(water);
      sql += ` AND water = $${++paramCount}`;
    }

    // Sorting
    switch (sort) {
      case 'rent_asc': sql += ' ORDER BY rent_amount ASC'; break;
      case 'rent_desc': sql += ' ORDER BY rent_amount DESC'; break;
      case 'distance_asc': sql += ' ORDER BY distance_from_kiu ASC'; break;
      default: sql += ' ORDER BY created_at DESC';
    }

    // Pagination
    const offset = (Number(page) - 1) * Number(limit);
    params.push(Number(limit));
    sql += ` LIMIT $${++paramCount}`;
    params.push(offset);
    sql += ` OFFSET $${++paramCount}`;

    const result = await query(sql, params);
    res.json({ data: result.rows, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('List listings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Public: get single listing (limited)
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, title, house_type, rent_amount, area, distance_from_kiu, transport_time_boda,
        electricity, water, kitchen, bathroom, toilet, flooring, other_charges, photos, status
      FROM listings WHERE id = $1 AND status != 'SUSPENDED'`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Authenticated: get full listing (with landlord phone)
router.get('/:id/contact', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      'SELECT landlord_phone FROM listings WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json({ data: { landlordPhone: result.rows[0].landlord_phone } });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: create listing
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = createListingSchema.parse(req.body);

    let distance, boda, walk;
    if (data.latitude && data.longitude) {
      distance = distanceFromKiu(data.latitude, data.longitude);
      boda = bodaTime(distance);
      walk = walkTime(distance);
    }

    const result = await query(
      `INSERT INTO listings (admin_id, title, house_type, rent_amount, area, distance_from_kiu,
        transport_time_boda, transport_time_walk, electricity, water, kitchen, bathroom, toilet,
        flooring, other_charges, landlord_phone, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [req.user!.id, data.title, data.houseType, data.rentAmount, data.area,
        distance || null, boda || null, walk || null,
        data.electricity || null, data.water || null, data.kitchen || null,
        data.bathroom || null, data.toilet || null, data.flooring || null,
        data.otherCharges || null, data.landlordPhone || null,
        data.latitude || null, data.longitude || null]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: update listing
router.patch('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { title, rentAmount, area, status, landlordPhone, ...other } = req.body;
    const updates: string[] = [];
    const params: unknown[] = [];
    let paramCount = 0;

    if (title) { params.push(title); updates.push(`title = $${++paramCount}`); }
    if (rentAmount) { params.push(rentAmount); updates.push(`rent_amount = $${++paramCount}`); }
    if (area) { params.push(area); updates.push(`area = $${++paramCount}`); }
    if (status) { params.push(status); updates.push(`status = $${++paramCount}`); }
    if (landlordPhone) { params.push(landlordPhone); updates.push(`landlord_phone = $${++paramCount}`); }

    for (const [key, value] of Object.entries(other)) {
      if (value !== undefined) {
        params.push(value);
        updates.push(`${key} = $${++paramCount}`);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.params.id);
    const result = await query(
      `UPDATE listings SET ${updates.join(', ')}, updated_at = now() WHERE id = $${++paramCount} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: delete listing
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const result = await query('DELETE FROM listings WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.json({ message: 'Listing deleted' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: upload photo
router.post('/:id/photos', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { key, body, contentType } = req.body;
    if (!key || !body) {
      return res.status(400).json({ error: 'Photo key and body required' });
    }

    const url = await uploadPhoto(key, Buffer.from(body, 'base64'), contentType || 'image/jpeg');

    await query(
      'UPDATE listings SET photos = photos || $1::jsonb, updated_at = now() WHERE id = $2',
      [JSON.stringify([url]), req.params.id]
    );

    res.json({ url });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: delete photo
router.delete('/:id/photos/:photoId', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const listing = await query('SELECT photos FROM listings WHERE id = $1', [req.params.id]);
    if (listing.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const photos = listing.rows[0].photos || [];
    const photoUrl = photos[Number(req.params.photoId)];
    if (!photoUrl) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Delete from R2
    const key = photoUrl.split('/').pop();
    if (key) await deletePhoto(key);

    // Remove from array
    const newPhotos = photos.filter((_: string, i: number) => i !== Number(req.params.photoId));
    await query('UPDATE listings SET photos = $1::jsonb, updated_at = now() WHERE id = $2', [JSON.stringify(newPhotos), req.params.id]);

    res.json({ message: 'Photo deleted' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
