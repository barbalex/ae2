-- 1. create new taxonomy
INSERT INTO ae.taxonomy (id, type, name, description, links, last_updated, organization_id, imported_by, terms_of_use, tree_category)
  VALUES ('62a9144f-c0cd-4d31-8bf0-cf808ebcc832', 'Art', 'CSCF (2022)', 'Index der Info Fauna. Eigenschaften von 33''283 Tierarten', '{http://www.cscf.ch}', '2022-09-16', 'a8e5bc98-696f-11e7-b453-3741aafa0388', 'a8eeeaa2-696f-11e7-b454-83e34acbe09f', 'Importiert mit Einverständnis des Autors. Eine allfällige Weiterverbreitung ist nur mit dessen Zustimmung möglich.', '2aabf183-ad8c-4451-9aed-08ae38f8a73f');

-- 2. create temporary table
CREATE TABLE ae.tmp_ord_object (
  id uuid,
  name text DEFAULT NULL,
  taxonomy_id uuid DEFAULT NULL
);

-- 3. insert ordnungen in pgAdmin4
-- done
-- 4. Ordnungen importieren
INSERT INTO ae.object (id, name, taxonomy_id)
SELECT
  id,
  name,
  taxonomy_id
FROM
  ae.tmp_ord_object;

-- 5. tmp tabelle bauen
CREATE TABLE ae.tmp_object (
  -- id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc (),
  name text DEFAULT NULL,
  taxonomy_id uuid DEFAULT NULL,
  parent_id uuid DEFAULT NULL,
  taxonomie_id integer DEFAULT NULL,
  code text DEFAULT NULL,
  gattung text DEFAULT NULL,
  art text DEFAULT NULL,
  unterart text DEFAULT NULL,
  name_deutsch text DEFAULT NULL,
  synonym integer DEFAULT NULL,
  captx text DEFAULT NULL
);

-- 6. add id field
ALTER TABLE ae.tmp_object
  ADD COLUMN id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc ();

-- 6. insert values into ae.object
INSERT INTO ae.object (id, name, taxonomy_id, parent_id, properties)
SELECT
  id,
  name,
  taxonomy_id,
  parent_id,
  json_build_object('Taxonomie ID', o.taxonomie_id, 'Code', o.code, 'Gattung', o.gattung, 'Art', o.art, 'Unterart', o.unterart, 'Name Deutsch', o.name_deutsch, 'Artname vollständig', o.name, 'Synonym', o.synonym, 'CAPTX', o.captx, 'Taxon ID VDC', CONCAT('infospecies.ch:infofauna:', o.taxonomie_id))::jsonb
FROM
  ae.tmp_object o;

-- 8. own synonyms
-- SELECT
--   object.id,
--   synonym.id AS synonym_id
-- FROM
--   ae.object object
--   INNER JOIN ae.object synonym ON object.properties ->> 'Synonym' = synonym.properties ->> 'Taxonomie ID'
--     AND synonym.taxonomy_id = '62a9144f-c0cd-4d31-8bf0-cf808ebcc832'
-- WHERE
--   object.taxonomy_id = '62a9144f-c0cd-4d31-8bf0-cf808ebcc832'
--   AND object.properties ->> 'Taxonomie ID' IS NOT NULL
--   AND object.properties ->> 'Synonym' IS NOT NULL;
--
INSERT INTO ae.synonym (object_id, object_id_synonym)
SELECT
  object.id,
  synonym.id AS synonym_id
FROM
  ae.object object
  INNER JOIN ae.object synonym ON object.properties ->> 'Synonym' = synonym.properties ->> 'Taxonomie ID'
    AND synonym.taxonomy_id = '62a9144f-c0cd-4d31-8bf0-cf808ebcc832'
WHERE
  object.taxonomy_id = '62a9144f-c0cd-4d31-8bf0-cf808ebcc832'
  AND object.properties ->> 'Taxonomie ID' IS NOT NULL
  AND object.properties ->> 'Synonym' IS NOT NULL;

INSERT INTO ae.synonym (object_id_synonym, object_id)
SELECT
  object.id AS synonym_id,
  synonym.id
FROM
  ae.object object
  INNER JOIN ae.object synonym ON object.properties ->> 'Synonym' = synonym.properties ->> 'Taxonomie ID'
    AND synonym.taxonomy_id = '62a9144f-c0cd-4d31-8bf0-cf808ebcc832'
WHERE
  object.taxonomy_id = '62a9144f-c0cd-4d31-8bf0-cf808ebcc832'
  AND object.properties ->> 'Taxonomie ID' IS NOT NULL
  AND object.properties ->> 'Synonym' IS NOT NULL;

-- 9. synonyms from cscf 2009
-- SELECT
--   object.id,
--   synonym.id AS synonym_id
-- FROM
--   ae.object object
--   INNER JOIN ae.object synonym ON object.properties ->> 'Taxonomie ID' = synonym.properties ->> 'Taxonomie ID'
--     AND synonym.taxonomy_id = 'aed47d40-7b0e-11e8-b9a5-bd4f79edbcc4'
-- WHERE
--   object.taxonomy_id = '62a9144f-c0cd-4d31-8bf0-cf808ebcc832'
--   AND object.properties ->> 'Taxonomie ID' IS NOT NULL;
--
INSERT INTO ae.synonym (object_id_synonym, object_id)
SELECT
  object.id,
  synonym.id AS synonym_id
FROM
  ae.object object
  INNER JOIN ae.object synonym ON object.properties ->> 'Taxonomie ID' = synonym.properties ->> 'Taxonomie ID'
    AND synonym.taxonomy_id = 'aed47d40-7b0e-11e8-b9a5-bd4f79edbcc4'
WHERE
  object.taxonomy_id = '62a9144f-c0cd-4d31-8bf0-cf808ebcc832'
  AND object.properties ->> 'Taxonomie ID' IS NOT NULL;

INSERT INTO ae.synonym (object_id, object_id_synonym)
SELECT
  object.id,
  synonym.id AS synonym_id
FROM
  ae.object object
  INNER JOIN ae.object synonym ON object.properties ->> 'Taxonomie ID' = synonym.properties ->> 'Taxonomie ID'
    AND synonym.taxonomy_id = 'aed47d40-7b0e-11e8-b9a5-bd4f79edbcc4'
WHERE
  object.taxonomy_id = '62a9144f-c0cd-4d31-8bf0-cf808ebcc832'
  AND object.properties ->> 'Taxonomie ID' IS NOT NULL;

-- 10. add Artname vollständig (only first time)
-- UPDATE
--   ae.object
-- SET
--   "properties" = jsonb_set("properties"::jsonb, '{"Artname vollständig"}',  to_jsonb(name))
-- WHERE
--   taxonomy_id = '62a9144f-c0cd-4d31-8bf0-cf808ebcc832'
--   AND properties ->> 'Taxonomie ID' IS NOT NULL;
--
-- 10. add Taxon ID VDC (only first time)
-- UPDATE
--   ae.object
-- SET
--   "properties" = jsonb_set("properties"::jsonb, '{"Taxon ID VDC"}', to_jsonb (CONCAT('infospecies.ch:infofauna:', properties ->> 'Taxonomie ID')))
-- WHERE
--   taxonomy_id = '62a9144f-c0cd-4d31-8bf0-cf808ebcc832'
--   AND properties ->> 'Taxonomie ID' IS NOT NULL;
--
-- TODO: remove tmp tables
