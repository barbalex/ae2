CREATE OR REPLACE VIEW ae.taxonomy_writers AS SELECT DISTINCT
  ae.user.name
FROM
  ae.organization_user
  INNER JOIN ae.user ON ae.user.id = ae.organization_user.user_id
WHERE
  ae.organization_user.role IN ('orgTaxonomyWriter', 'orgAdmin');

CREATE OR REPLACE VIEW ae.current_user_writable_taxonomies AS SELECT DISTINCT
  ae.taxonomy.id
FROM
  ae.taxonomy
WHERE
  ae.taxonomy.id IN ( SELECT DISTINCT
      ae.taxonomy.id
    FROM
      ae.taxonomy
      INNER JOIN ae.organization_user
      INNER JOIN ae.user ON ae.user.id = ae.organization_user.user_id ON ae.organization_user.organization_id = ae.taxonomy.organization_id
    WHERE
      ae.user.name = current_user_name ()
      AND ae.organization_user.role IN ('orgTaxonomyWriter', 'orgAdmin'))
  OR (ae.taxonomy.id IN (
      SELECT
        taxonomy.id
      FROM
        ae.taxonomy
      WHERE
        organization_id IS NULL)
      AND current_user_name () IN (
        SELECT
          *
        FROM
          ae.taxonomy_writers));

CREATE OR REPLACE VIEW ae.organizations_currentuser_is_taxonomywriter AS SELECT DISTINCT
  ae.organization_user.organization_id
FROM
  ae.organization_user
  INNER JOIN ae.user ON ae.user.id = ae.organization_user.user_id
WHERE
  ae.user.name = current_user_name ()
  AND ae.organization_user.role IN ('orgTaxonomyWriter', 'orgAdmin');

CREATE OR REPLACE VIEW ae.organization_admins AS SELECT DISTINCT
  ae.user.name
FROM
  ae.organization_user
  INNER JOIN ae.user ON ae.user.id = ae.organization_user.user_id
WHERE
  ae.organization_user.role IN ('orgAdmin');

CREATE OR REPLACE VIEW ae.collection_writers AS SELECT DISTINCT
  ae.user.name
FROM
  ae.organization_user
  INNER JOIN ae.user ON ae.user.id = ae.organization_user.user_id
WHERE
  ae.organization_user.role IN ('orgCollectionWriter', 'orgAdmin');

CREATE OR REPLACE VIEW ae.organizations_currentuser_is_collectionwriter AS SELECT DISTINCT
  ae.organization_user.organization_id
FROM
  ae.organization_user
  INNER JOIN ae.user ON ae.user.id = ae.organization_user.user_id
WHERE
  ae.user.name = current_user_name ()
  AND ae.organization_user.role IN ('orgCollectionWriter', 'orgAdmin');

CREATE OR REPLACE VIEW ae.organizations_currentuser_is_orgadmin AS SELECT DISTINCT
  ae.organization_user.organization_id
FROM
  ae.organization_user
  INNER JOIN ae.user ON ae.user.id = ae.organization_user.user_id
WHERE
  ae.user.name = current_user_name ()
  AND ae.organization_user.role IN ('orgAdmin');

CREATE OR REPLACE VIEW ae.current_user_writable_collections AS SELECT DISTINCT
  ae.property_collection.id
FROM
  ae.property_collection
  INNER JOIN ae.organization_user
  INNER JOIN ae.user ON ae.user.id = ae.organization_user.user_id ON ae.organization_user.organization_id = ae.property_collection.organization_id
WHERE
  ae.user.name = current_user_name ()
  AND ae.organization_user.role IN ('orgCollectionWriter', 'orgAdmin');

-- view for vermehrung.apflora.ch
DROP VIEW IF EXISTS ae.v_vermehrung_arten CASCADE;

CREATE OR REPLACE VIEW ae.v_vermehrung_arten AS
SELECT
  id,
  name,
  properties ->> 'Artname' AS name_latein,
  CASE WHEN properties ->> 'Name Deutsch' IS NOT NULL THEN
    properties ->> 'Name Deutsch'
  ELSE
    properties ->> 'Artname'
  END AS name_deutsch
FROM
  ae.object
WHERE
  taxonomy_id = 'aed47d41-7b0e-11e8-b9a5-bd4f79edbcc4'
  AND properties ->> 'Artname' IS NOT NULL
ORDER BY
  name;

-- view for apflora.ch
DROP VIEW IF exist ae.v_apflora_lr_delarze CASCADE;

CREATE OR REPLACE VIEW ae.v_apflora_lr_delarze AS
SELECT
  id,
  properties ->> 'Label' AS label,
  properties ->> 'Einheit' AS einheit,
  name
FROM
  ae.object
WHERE
  taxonomy_id = '69d34753-445b-4c55-b3b7-e570f7dc1819'
ORDER BY
  label;

-- v_apflora_taxonomies for apflora.ch
DROP VIEW IF EXISTS ae.v_apflora_taxonomies CASCADE;

CREATE OR REPLACE VIEW ae.v_apflora_taxonomies AS
with objartwert AS (
  SELECT
    *
  FROM
    ae.property_collection_object
  WHERE
    property_collection_id = 'bdf89414-7b0e-11e8-a170-ab93aeea0aac'
)
SELECT DISTINCT
  tax.id AS taxonomie_id,
  tax.name AS taxonomie_name,
  ae.object.id,
  cast(ae.object.properties ->> 'Taxonomie ID' AS integer) AS taxid,
  ae.object.properties ->> 'Familie' AS familie,
  ae.object.name AS artname,
  coalesce(cast(objartwert.properties ->> 'Artwert' AS integer), cast(synobjartwert.properties ->> 'Artwert' AS integer), cast(synobjartwert2.properties ->> 'Artwert' AS integer)) AS artwert
FROM
  ae.object
  INNER JOIN ae.taxonomy tax ON tax.id = ae.object.taxonomy_id
  LEFT JOIN ae.synonym synonym
  INNER JOIN objartwert synobjartwert ON synobjartwert.object_id = synonym.object_id_synonym ON ae.object.id = synonym.object_id -- account for both ways an object can be defined as synonym
  LEFT JOIN ae.synonym synonym2
  INNER JOIN objartwert synobjartwert2 ON synobjartwert2.object_id = synonym2.object_id_synonym ON ae.object.id = synonym2.object_id_synonym
  LEFT JOIN objartwert ON objartwert.object_id = ae.object.id
WHERE
  -- sisf index 2
  taxonomy_id IN ('aed47d41-7b0e-11e8-b9a5-bd4f79edbcc4', 'c87f19f2-1b77-11ea-8282-bbc40e20aff6') -- only lowest hierarchy, not pure structural objects
  AND ae.object.properties ->> 'Taxonomie ID' IS NOT NULL
ORDER BY
  tax.name,
  ae.object.name;

