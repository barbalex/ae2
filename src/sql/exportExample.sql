-- object and pc
SELECT
  ae.object.*
FROM
  ae.object
  INNER JOIN ae.taxonomy ON ae.taxonomy.id = ae.object.taxonomy_id
  LEFT JOIN ae.property_collection_object pco ON ae.object.id = pco.object_id
  LEFT JOIN ae.property_collection pc ON pco.property_collection_id = pc.id
  LEFT JOIN ae.relation ON ae.object.id = ae.relation.object_id
  LEFT JOIN ae.property_collection rc ON ae.relation.property_collection_id = rc.id
WHERE
  ae.taxonomy.name IN ('SISF (2005)') -- $1
  AND ae.object.properties ->> 'Artname vollständig' ILIKE '%rosa%'
  AND pc.name IN ('CH OeQV')
  AND (pc.name = 'CH OeQV'
    AND pco.properties ->> 'Art ist Qualitätszeiger Liste A' = 'true')
  AND ((rc.name = 'ZH AP FM (2010)'
      AND ae.relation.relation_type = 'Art ist an Lebensraum gebunden'))
  AND (rc.name = 'ZH AP FM (2010)'
    AND ae.relation.properties ->> 'Biotopbindung' ILIKE '%2%');

