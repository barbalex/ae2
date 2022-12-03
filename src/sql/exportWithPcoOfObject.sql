-- object and pc
SELECT
  ae.object.*
FROM
  ae.object
  INNER JOIN ae.taxonomy ON ae.taxonomy.id = ae.object.taxonomy_id
  LEFT JOIN ae.pco_of_object pcoo ON pcoo.object_id = ae.object.id
  INNER JOIN ae.property_collection_object pco ON pco.id = pcoo.pco_id
  INNER JOIN ae.property_collection pc ON pc.id = pco.property_collection_id
WHERE
  ae.taxonomy.name IN ('SISF (2005)')
  AND ae.object.properties ->> 'Artname vollständig' ILIKE '%rosa%'
  AND (pc.name = 'CH OeQV'
    AND pco.properties ->> 'Art ist Qualitätszeiger Liste A' = 'true');

