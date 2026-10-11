import { Router } from 'express';
import { z } from 'zod';
import { query } from '../../db';
import { authenticate, requireLandlord, AuthRequest } from '../../middleware/auth';
import { uploadPhoto, deletePhoto } from '../../utils/storage';
import { getRoadDistanceFromKiu } from '../../utils/distance';

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
  transportInfo: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

const verifyIdentitySchema = z.object({
  nationalId: z.string().min(5),
  phone: z.string().min(10)
});

// Landlord: get all their listings
router.get('/listings', authenticate, requireLandlord, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      'SELECT * FROM listings WHERE landlord_id = $1 ORDER BY created_at DESC',
      [req.user!.id]
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Landlord listings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Landlord: create listing
router.post('/listings', authenticate, requireLandlord, async (req: AuthRequest, res) => {
  try {
    const data = createListingSchema.parse(req.body);

    // Calculate road distance using OSRM if coordinates provided
    let osrmDistance = null;
    if (data.latitude && data.longitude) {
      osrmDistance = await getRoadDistanceFromKiu(data.latitude, data.longitude);
    }

    const result = await query(
      `INSERT INTO listings (landlord_id, title, house_type, rent_amount, area, osrm_distance_km,
        transport_info, electricity, water, kitchen, bathroom, toilet,
        flooring, other_charges, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [req.user!.id, data.title, data.houseType, data.rentAmount, data.area,
        osrmDistance, data.transportInfo || null,
        data.electricity || null, data.water || null, data.kitchen || null,
        data.bathroom || null, data.toilet || null, data.flooring || null,
        data.otherCharges || null, data.latitude || null, data.longitude || null]
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

// Landlord: update listing
router.patch('/listings/:id', authenticate, requireLandlord, async (req: AuthRequest, res) => {
  try {
    const existing = await query(
      'SELECT id FROM listings WHERE id = $1 AND landlord_id = $2',
      [req.params.id, req.user!.id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const { title, rentAmount, area, status, transportInfo, ...other } = req.body;
    const updates: string[] = [];
    const params: unknown[] = [];
    let paramCount = 0;

    if (title) { params.push(title); updates.push(`title = $${++paramCount}`); }
    if (rentAmount) { params.push(rentAmount); updates.push(`rent_amount = $${++paramCount}`); }
    if (area) { params.push(area); updates.push(`area = $${++paramCount}`); }
    if (status) { params.push(status); updates.push(`status = $${++paramCount}`); }
    if (transportInfo) { params.push(transportInfo); updates.push(`transport_info = $${++paramCount}`); }

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

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Landlord: delete listing
router.delete('/listings/:id', authenticate, requireLandlord, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      'DELETE FROM listings WHERE id = $1 AND landlord_id = $2 RETURNING id',
      [req.params.id, req.user!.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.json({ message: 'Listing deleted' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Landlord: get their inspections
router.get('/inspections', authenticate, requireLandlord, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      `SELECT i.*, l.title as listing_title, p.name as student_name, p.email as student_email
      FROM inspections i
      JOIN listings l ON i.listing_id = l.id
      JOIN profiles p ON i.student_id = p.id
      WHERE l.landlord_id = $1
      ORDER BY i.created_at DESC`,
      [req.user!.id]
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Landlord inspections error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Landlord: accept inspection
router.patch('/inspections/:id/accept', authenticate, requireLandlord, async (req: AuthRequest, res) => {
  try {
    const inspection = await query(
      `SELECT i.id FROM inspections i
      JOIN listings l ON i.listing_id = l.id
      WHERE i.id = $1 AND l.landlord_id = $2`,
      [req.params.id, req.user!.id]
    );
    if (inspection.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    const result = await query('SELECT accept_inspection($1) as code', [req.params.id]);
    const code = result.rows[0].code;

    res.json({ message: 'Inspection accepted', code });
  } catch (error) {
    console.error('Accept inspection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Landlord: decline inspection
router.patch('/inspections/:id/decline', authenticate, requireLandlord, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      `UPDATE inspections i SET status = 'DECLINED'
      FROM listings l
      WHERE i.id = $1 AND i.listing_id = l.id AND l.landlord_id = $2
      RETURNING i.*`,
      [req.params.id, req.user!.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    await query("UPDATE listings SET status = 'AVAILABLE' WHERE id = $1", [result.rows[0].listing_id]);

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Decline inspection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Landlord: verify inspection code
router.post('/inspections/:id/verify', authenticate, requireLandlord, async (req: AuthRequest, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code required' });
    }

    const inspection = await query(
      `SELECT i.id FROM inspections i
      JOIN listings l ON i.listing_id = l.id
      WHERE i.id = $1 AND l.landlord_id = $2`,
      [req.params.id, req.user!.id]
    );
    if (inspection.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    const result = await query('SELECT verify_inspection_code($1, $2) as verified', [req.params.id, code]);

    if (!result.rows[0].verified) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    res.json({ message: 'Inspection verified' });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Landlord: submit identity verification
router.post('/verify-identity', authenticate, requireLandlord, async (req: AuthRequest, res) => {
  try {
    const { nationalId, phone } = verifyIdentitySchema.parse(req.body);

    const existing = await query(
      'SELECT status FROM landlord_verifications WHERE landlord_id = $1 ORDER BY created_at DESC LIMIT 1',
      [req.user!.id]
    );
    if (existing.rows.length > 0 && existing.rows[0].status === 'PENDING') {
      return res.status(400).json({ error: 'Verification already pending' });
    }

    const result = await query(
      'INSERT INTO landlord_verifications (landlord_id, national_id_number, phone) VALUES ($1, $2, $3) RETURNING *',
      [req.user!.id, nationalId, phone]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Verify identity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Landlord: get verification status
router.get('/verification-status', authenticate, requireLandlord, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      'SELECT status, reviewed_at, rejection_reason FROM landlord_verifications WHERE landlord_id = $1 ORDER BY created_at DESC LIMIT 1',
      [req.user!.id]
    );
    res.json({ data: result.rows[0] || null });
  } catch (error) {
    console.error('Verification status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Landlord: get dashboard stats
router.get('/stats', authenticate, requireLandlord, async (req: AuthRequest, res) => {
  try {
    const [listings, inspections, pendingInspections] = await Promise.all([
      query('SELECT COUNT(*) FROM listings WHERE landlord_id = $1', [req.user!.id]),
      query(
        `SELECT COUNT(*) FROM inspections i JOIN listings l ON i.listing_id = l.id WHERE l.landlord_id = $1`,
        [req.user!.id]
      ),
      query(
        `SELECT COUNT(*) FROM inspections i JOIN listings l ON i.listing_id = l.id WHERE l.landlord_id = $1 AND i.status = 'REQUESTED'`,
        [req.user!.id]
      )
    ]);

    res.json({
      totalListings: parseInt(listings.rows[0].count),
      totalInspections: parseInt(inspections.rows[0].count),
      pendingInspections: parseInt(pendingInspections.rows[0].count)
    });
  } catch (error) {
    console.error('Landlord stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Landlord: upload photo to listing
router.post('/listings/:id/photos', authenticate, requireLandlord, async (req: AuthRequest, res) => {
  try {
    const { key, body, contentType } = req.body;
    if (!key || !body) {
      return res.status(400).json({ error: 'Photo key and body required' });
    }

    const listing = await query(
      'SELECT id FROM listings WHERE id = $1 AND landlord_id = $2',
      [req.params.id, req.user!.id]
    );
    if (listing.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
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

export default router;
