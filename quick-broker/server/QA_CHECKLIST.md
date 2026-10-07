# Quick-Broker — QA Checklist

## Critical User Journeys

### 1. Student Journey
- [ ] Register with email → receive OTP → verify → logged in
- [ ] Browse listings without account (preview mode)
- [ ] Search listings by area
- [ ] Filter listings by house type
- [ ] Filter listings by budget range
- [ ] Filter listings by distance from KIU
- [ ] Filter listings by facilities (kitchen, bathroom, toilet)
- [ ] Filter listings by electricity/water arrangement
- [ ] Sort listings by rent (ascending/descending)
- [ ] Sort listings by distance
- [ ] View listing details
- [ ] Save a house
- [ ] Unsave a house
- [ ] View saved houses
- [ ] Compare houses side-by-side
- [ ] Request inspection
- [ ] View inspection status
- [ ] View inspection code
- [ ] Mark inspection as interested
- [ ] Mark inspection as not interested
- [ ] Mark inspection as rented
- [ ] Write review after verified inspection
- [ ] View reviews on listing
- [ ] Report a listing
- [ ] Call landlord (tel: link)
- [ ] WhatsApp landlord (wa.me link)

### 2. Admin Journey
- [ ] Login as admin
- [ ] View dashboard stats
- [ ] Create new listing
- [ ] Edit existing listing
- [ ] Delete listing
- [ ] Upload photos to listing
- [ ] Reorder photos
- [ ] Delete photos
- [ ] Mark listing as occupied
- [ ] Mark listing as available
- [ ] View all inspections
- [ ] Accept inspection request
- [ ] Decline inspection request
- [ ] Reschedule inspection
- [ ] Verify inspection code
- [ ] View all reports
- [ ] Resolve report
- [ ] Dismiss report
- [ ] Suspend listing
- [ ] Hide inappropriate review

### 3. Auth Flow
- [ ] Send OTP to valid email
- [ ] Reject invalid email format
- [ ] Reject expired OTP
- [ ] Reject already-used OTP
- [ ] Rate limit on send-otp endpoint
- [ ] Rate limit on verify-otp endpoint
- [ ] Refresh token works
- [ ] Logout invalidates refresh token
- [ ] Protected routes redirect to login

## API Endpoints

### Auth
- [ ] POST /api/auth/send-otp
- [ ] POST /api/auth/verify-otp
- [ ] POST /api/auth/refresh
- [ ] POST /api/auth/logout

### Users
- [ ] GET /api/users/me
- [ ] PATCH /api/users/me

### Listings
- [ ] GET /api/listings (public preview)
- [ ] GET /api/listings?full=true (authenticated)
- [ ] GET /api/listings/:id
- [ ] POST /api/listings (admin)
- [ ] PATCH /api/listings/:id (admin)
- [ ] DELETE /api/listings/:id (admin)
- [ ] POST /api/listings/:id/photos (admin)
- [ ] DELETE /api/listings/:id/photos/:photoId (admin)
- [ ] PATCH /api/listings/:id/status (admin)

### Inspections
- [ ] POST /api/inspections
- [ ] GET /api/inspections (admin)
- [ ] GET /api/inspections/my (student)
- [ ] GET /api/inspections/:id
- [ ] PATCH /api/inspections/:id/accept (admin)
- [ ] PATCH /api/inspections/:id/decline (admin)
- [ ] PATCH /api/inspections/:id/reschedule (admin)
- [ ] GET /api/inspections/:id/code (student)
- [ ] POST /api/inspections/:id/verify (admin)
- [ ] POST /api/inspections/:id/interested
- [ ] POST /api/inspections/:id/not-interested
- [ ] POST /api/inspections/:id/rented

### Saved & Compare
- [ ] POST /api/saved
- [ ] DELETE /api/saved/:listingId
- [ ] GET /api/saved

### Reviews
- [ ] POST /api/reviews
- [ ] GET /api/reviews/listing/:listingId
- [ ] PATCH /api/reviews/:id/hide (admin)

### Reports
- [ ] POST /api/reports
- [ ] GET /api/reports (admin)
- [ ] PATCH /api/reports/:id (admin)
- [ ] PATCH /api/reports/listings/:id/suspend (admin)

### Admin
- [ ] GET /api/admin/listings
- [ ] GET /api/admin/stats

### Contact
- [ ] GET /api/listings/:id/contact (authenticated)

## Security
- [ ] JWT tokens expire correctly
- [ ] Refresh tokens expire after 7 days
- [ ] Rate limiting works on auth endpoints
- [ ] Admin-only endpoints reject non-admin users
- [ ] Students can only view own inspections
- [ ] Students can only view own saved houses
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization)
- [ ] CORS configured correctly

## Performance
- [ ] API responds within 500ms for listings
- [ ] Pagination works correctly
- [ ] Database indexes are used
- [ ] Images load quickly

## PWA
- [ ] App is installable
- [ ] Service worker caches assets
- [ ] Offline shell works
- [ ] App manifest is valid
