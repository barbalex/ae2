-- 1. TODO: create table with import-data
CREATE TABLE ae.tmp_fungi (
  taxon_id_vdc text,
  artname_vollstaendig text,
  taxonomie_id integer NOT NULL,
  name text,
  autor text,
  name_deutsch text,
  rote_liste_2007 text,
  funktionelle_gruppe text,
  substratgruppe text
);

-- 2. import in pgadmin4
-- 3. test
SELECT
  o.properties -> 'Taxonomie ID' AS taxonomie_id,
  fungi.artname_vollstaendig AS name,
  jsonb_build_object('Taxon ID VDC', fungi.taxon_id_vdc, 'Artname vollständig', fungi.artname_vollstaendig, 'Taxonomie ID', fungi.taxonomie_id, 'Name', fungi.name, 'Autor', fungi.autor, 'Name Deutsch', fungi.name_deutsch, 'Rote Liste 2007', fungi.rote_liste_2007, 'Funktionelle Gruppe', fungi.funktionelle_gruppe, 'Substratgruppe', fungi.substratgruppe) AS properties
FROM
  ae.tmp_fungi fungi
  INNER JOIN ae.object o ON o.properties ->> 'Taxonomie ID' = fungi.taxonomie_id::text
WHERE
  o.taxonomy_id = 'aed47d42-7b0e-11e8-b9a5-bd4f79edbcc4'
ORDER BY
  o.properties -> 'Taxonomie ID';

-- 4. TODO: update taxon id vdc
UPDATE
  ae.object
SET
  name = fungi.artname_vollstaendig,
  properties = jsonb_build_object('Taxon ID VDC', fungi.taxon_id_vdc, 'Artname vollständig', fungi.artname_vollstaendig, 'Taxonomie ID', fungi.taxonomie_id, 'Name', fungi.name, 'Autor', fungi.autor, 'Name Deutsch', fungi.name_deutsch, 'Rote Liste 2007', fungi.rote_liste_2007, 'Funktionelle Gruppe', fungi.funktionelle_gruppe, 'Substratgruppe', fungi.substratgruppe)
FROM
  ae.tmp_fungi fungi
WHERE
  ae.object.properties ->> 'Taxonomie ID' = fungi.taxonomie_id::text
  AND ae.object.taxonomy_id = 'aed47d42-7b0e-11e8-b9a5-bd4f79edbcc4';

