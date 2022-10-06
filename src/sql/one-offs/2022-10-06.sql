UPDATE
  ae.object
SET
  "properties" = json_build_object('Taxonomie ID', o.taxonomie_id, 'Code', o.code, 'Gattung', o.gattung, 'Art', o.art, 'Unterart', o.unterart, 'Name Deutsch', o.name_deutsch, 'Artname vollständig', o.name, 'Synonym', o.synonym, 'CAPTX', o.captx, 'Taxon ID VDC', CONCAT('infospecies.ch:infofauna:', o.taxonomie_id))::jsonb
FROM
  ae.tmp_object o
WHERE
  ae.object.id = o.id;

