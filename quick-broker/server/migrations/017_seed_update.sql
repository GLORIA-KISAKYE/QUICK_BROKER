-- Update seed listings to use transport_info instead of boda time
UPDATE listings SET
  transport_info = '10 min by boda, 25 min walk',
  osrm_distance_km = 1.2
WHERE title = 'Double Room in Kakoba';

UPDATE listings SET
  transport_info = '5 min by boda, 12 min walk',
  osrm_distance_km = 0.8
WHERE title = 'Self-Contained Single in Ishaka Town';

UPDATE listings SET
  transport_info = '15 min by boda, 35 min walk',
  osrm_distance_km = 2.5
WHERE title = 'Single Room near Campus';
