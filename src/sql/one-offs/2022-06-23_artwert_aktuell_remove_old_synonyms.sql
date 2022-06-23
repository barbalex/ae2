-- for:
-- all synonyms of objects from taxonomy "SISF (2005)" contained in "ZH Artwert (2020)":
-- remove dataset included in "ZH Artwert (aktuell)"
-- 1. list all synonyms of objects contained in "ZH Artwert (2020)"
SELECT
  object.id,
  object.name
FROM
  ae.object object
  INNER JOIN ae.taxonomy tax ON tax.id = object.taxonomy_id
    AND tax.name = 'SISF (2005)'
  INNER JOIN ae.synonym synonym ON synonym.object_id = object.id
  INNER JOIN ae.property_collection_object pc_object ON synonym.object_id_synonym = pc_object.object_id
  INNER JOIN ae.property_collection pc ON pc.id = pc_object.property_collection_id
    AND pc.name = 'ZH Artwert (2020)'
  ORDER BY
    object.name;

WITH (
  SELECT
    object.id
  FROM
    ae.object object
    INNER JOIN ae.taxonomy tax ON tax.id = object.taxonomy_id
      AND tax.name = 'SISF (2005)'
    INNER JOIN ae.synonym synonym ON synonym.object_id = object.id
    INNER JOIN ae.property_collection_object pc_object ON synonym.object_id_synonym = pc_object.object_id
    INNER JOIN ae.property_collection pc ON pc.id = pc_object.property_collection_id
      AND pc.name = 'ZH Artwert (2020)'
    ORDER BY
      object.name
) AS objects_of_interest select * FROM ae.property_collection_object pc_object
WHERE pc_object.object_id IN (
    objects_of_interest);

WITH (
  SELECT
    object.id
  FROM
    ae.object object
    INNER JOIN ae.taxonomy tax ON tax.id = object.taxonomy_id
      AND tax.name = 'SISF (2005)'
    INNER JOIN ae.synonym synonym ON synonym.object_id = object.id
    INNER JOIN ae.property_collection_object pc_object ON synonym.object_id_synonym = pc_object.object_id
    INNER JOIN ae.property_collection pc ON pc.id = pc_object.property_collection_id
      AND pc.name = 'ZH Artwert (2020)'
    ORDER BY
      object.name
) AS objects_of_interest DELETE FROM ae.property_collection_object pc_object
WHERE pc_object.object_id IN (
    objects_of_interest);

