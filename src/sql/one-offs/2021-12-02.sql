-- 9 results
SELECT
  *
FROM
  ae.property_collection
WHERE
  links = '{http://naturschutz.zh.ch}'
ORDER BY
  name ASC;

-- update:
UPDATE
  ae.property_collection
SET
  links = '{https://zh.ch/naturschutz}'
WHERE
  links = '{http://naturschutz.zh.ch}';

