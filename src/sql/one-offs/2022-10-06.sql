-- 1. correct last import
UPDATE
  ae.object
SET
  "properties" = json_build_object('Taxonomie ID', o.taxonomie_id, 'Code', o.code, 'Gattung', o.gattung, 'Art', o.art, 'Unterart', o.unterart, 'Name Deutsch', o.name_deutsch, 'Artname vollständig', o.name, 'Synonym', o.synonym, 'CAPTX', o.captx, 'Taxon ID VDC', CONCAT('infospecies.ch:infofauna:', o.taxonomie_id))::jsonb
FROM
  ae.tmp_object o
WHERE
  ae.object.id = o.id;

-- 2. create table to correct vdc-ids
CREATE TABLE ae.tmp_object_aves_vdc_id (
  taxon_id_vdc text NOT NULL,
  id uuid NOT NULL
);

-- 3. import in pgadmin4
-- 4. update taxon id vdc
UPDATE
  ae.object
SET
  "properties" = jsonb_set("properties"::jsonb, '{"Taxon ID VDC"}', to_jsonb (aves.taxon_id_vdc))
FROM
  ae.tmp_object_aves_vdc_id aves
WHERE
  ae.object.id = aves.id;

