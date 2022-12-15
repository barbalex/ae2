SELECT DISTINCT
  jsonb_object_keys(properties)
FROM
  ae.object;

-- export and check
SELECT
  *
FROM
  ae.object
WHERE
  properties ? '
Art';

