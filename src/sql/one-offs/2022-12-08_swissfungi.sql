-- 1. TODO: create table with import-data
CREATE TABLE ae.tmp_fungi (
  taxon_id_vdc text NOT NULL,
  id uuid NOT NULL
);

-- 2. import in pgadmin4
-- 3. TODO: update taxon id vdc
UPDATE
  ae.object
SET
  name = fungi.artname_vollstaendig,
  properties = '{"Taxon ID VDC": "' || fungi.taxon_id_vdc || '", "Artname vollständig": "' || fungi.artname_vollstaendig || '", "Taxonomie ID": ' || fungi.taxonomie_id || ', "Name": "' || fungi.name || '", "Autor": "' || fungi.autor || '", "Name Deutsch": "' || fungi.name_deutsch || '", "Rote Liste 2007": "' || fungi.rote_liste_2007 || '", "Funktionelle Gruppe": "' || fungi.funktionelle_gruppe || '", "Substratgruppe": "' || fungi.substratgruppe || '"}'
FROM
  ae.tmp_fungi fungi
WHERE
  ae.object.properties -> 'Taxonomie ID' = fungi.taxonomie_id;

