-- object and pc
SELECT
  ae.object.*
FROM
  ae.object
  INNER JOIN ae.taxonomy ON ae.taxonomy.id = ae.object.taxonomy_id
  INNER JOIN ae.property_collection_object pco ON pco.object_id IN (
    SELECT
      object_id_synonym
    FROM
      ae.synonym
    WHERE
      object_id = ae.object.id
    UNION
    SELECT
      id
    FROM
      ae.object
    WHERE
      id = ae.object.id)
    INNER JOIN ae.property_collection pc ON pco.property_collection_id = pc.id
    INNER JOIN ae.relation ON ae.relation.object_id IN (
      SELECT
        object_id_synonym
      FROM
        ae.synonym
      WHERE
        object_id = ae.object.id
      UNION
      SELECT
        id
      FROM
        ae.object
      WHERE
        id = ae.object.id)
      INNER JOIN ae.property_collection rc ON ae.relation.property_collection_id = rc.id
    WHERE
      ae.taxonomy.name IN ('SISF (2005)') -- $1
      AND ae.object.properties ->> 'Artname vollständig' ILIKE '%rosa%'
      AND pc.name IN ('CH OeQV') -- necessary?
      AND (pc.name = 'CH OeQV'
        AND pco.properties ->> 'Art ist Qualitätszeiger Liste A' = 'true')
      AND ((rc.name = 'ZH AP FM (2010)'
          AND ae.relation.relation_type = 'Art ist an Lebensraum gebunden'))
      AND (rc.name = 'ZH AP FM (2010)'
        AND ae.relation.properties ->> 'Biotopbindung' ILIKE '%2%');

