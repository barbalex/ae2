-- 1. create new taxonomy
INSERT INTO ae.taxonomy (id, type, name, description, links, last_updated, organization_id, imported_by, terms_of_use, tree_category)
  VALUES ('62a9144f-c0cd-4d31-8bf0-cf808ebcc832', 'Art', 'CSCF (2022)', 'Index der Info Fauna. Eigenschaften von 33283 Tierarten', '{http://www.cscf.ch}', '2022-09-16', 'a8e5bc98-696f-11e7-b453-3741aafa0388', 'a8eeeaa2-696f-11e7-b454-83e34acbe09f', 'Importiert mit Einverständnis des Autors. Eine allfällige Weiterverbreitung ist nur mit dessen Zustimmung möglich.', '2aabf183-ad8c-4451-9aed-08ae38f8a73f');

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
  "Taxonomie ID" integer DEFAULT NULL,
  "Code" text DEFAULT NULL,
  "Gattung" text DEFAULT NULL,
  "Art" text DEFAULT NULL,
  "Unterart" text DEFAULT NULL,
  "Name Deutsch" text DEFAULT NULL,
  "Synonym" integer DEFAULT NULL,
  "CAPTX" text DEFAULT NULL
);

-- 6. add id field
ALTER TABLE ae.tmp_object
  ADD COLUMN id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc ();

-- 6. insert fields into ae.object
INSERT INTO ae.object (id, name, taxonomy_id, parent_id)
SELECT
  id,
  name,
  taxonomy_id,
  parent_id
FROM
  ae.tmp_object;

-- 7. insert properties
