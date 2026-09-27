CREATE OR REPLACE VIEW listing_ratings AS
SELECT
  listing_id,
  AVG(rating) AS avg_rating,
  AVG(accuracy_rating) AS avg_accuracy,
  AVG(water_rating) AS avg_water,
  AVG(electricity_rating) AS avg_electricity,
  AVG(location_rating) AS avg_location,
  COUNT(*) AS review_count
FROM reviews
WHERE is_hidden = FALSE
GROUP BY listing_id;
