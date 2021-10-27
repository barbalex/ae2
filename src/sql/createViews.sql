create or replace view ae.taxonomy_writers as
select distinct ae.user.name
from ae.organization_user
  inner join ae.user on ae.user.id = ae.organization_user.user_id
where ae.organization_user.role in ('orgTaxonomyWriter', 'orgAdmin');
create or replace view ae.current_user_writable_taxonomies as
select distinct ae.taxonomy.id
from ae.taxonomy
where ae.taxonomy.id in (
    select distinct ae.taxonomy.id
    from ae.taxonomy
      inner join ae.organization_user
      inner join ae.user on ae.user.id = ae.organization_user.user_id on ae.organization_user.organization_id = ae.taxonomy.organization_id
    where ae.user.name = current_user_name()
      and ae.organization_user.role in ('orgTaxonomyWriter', 'orgAdmin')
  )
  or (
    ae.taxonomy.id in (
      select taxonomy.id
      from ae.taxonomy
      where organization_id is null
    )
    AND current_user_name() IN (
      SELECT *
      FROM ae.taxonomy_writers
    )
  );
create or replace view ae.organizations_currentuser_is_taxonomywriter as
select distinct ae.organization_user.organization_id
FROM ae.organization_user
  inner join ae.user on ae.user.id = ae.organization_user.user_id
where ae.user.name = current_user_name()
  and ae.organization_user.role in ('orgTaxonomyWriter', 'orgAdmin');
create or replace view ae.organization_admins as
select distinct ae.user.name
from ae.organization_user
  inner join ae.user on ae.user.id = ae.organization_user.user_id
where ae.organization_user.role in ('orgAdmin');
create or replace view ae.collection_writers as
select distinct ae.user.name
from ae.organization_user
  inner join ae.user on ae.user.id = ae.organization_user.user_id
where ae.organization_user.role in ('orgCollectionWriter', 'orgAdmin');
create or replace view ae.organizations_currentuser_is_collectionwriter as
select distinct ae.organization_user.organization_id
FROM ae.organization_user
  inner join ae.user on ae.user.id = ae.organization_user.user_id
where ae.user.name = current_user_name()
  and ae.organization_user.role in ('orgCollectionWriter', 'orgAdmin');
create or replace view ae.organizations_currentuser_is_orgadmin as
select distinct ae.organization_user.organization_id
FROM ae.organization_user
  inner join ae.user on ae.user.id = ae.organization_user.user_id
where ae.user.name = current_user_name()
  and ae.organization_user.role in ('orgAdmin');
create or replace view ae.current_user_writable_collections as
select distinct ae.property_collection.id
from ae.property_collection
  inner join ae.organization_user
  inner join ae.user on ae.user.id = ae.organization_user.user_id on ae.organization_user.organization_id = ae.property_collection.organization_id
where ae.user.name = current_user_name()
  and ae.organization_user.role in ('orgCollectionWriter', 'orgAdmin');
-- view for vermehrung.apflora.ch
DROP VIEW IF EXISTS ae.v_vermehrung_arten CASCADE;
CREATE OR REPLACE VIEW ae.v_vermehrung_arten AS
select id,
  name,
  properties->>'Artname' as name_latein,
  case
    when properties->>'Name Deutsch' is not null then properties->>'Name Deutsch'
    else properties->>'Artname'
  end as name_deutsch
from ae.object
where taxonomy_id = 'aed47d41-7b0e-11e8-b9a5-bd4f79edbcc4'
  and properties->>'Artname' is not null
order by name;
-- view for apflora.ch
drop view if exist ae.v_apflora_lr_delarze cascade;
create or replace view ae.v_apflora_lr_delarze as
select id,
  properties->>'Label' as label,
  properties->>'Einheit' as einheit,
  name
from ae.object
where taxonomy_id = '69d34753-445b-4c55-b3b7-e570f7dc1819'
order by label;
-- v_apflora_taxonomies
drop view if exists ae.v_apflora_taxonomies cascade;
create or replace view ae.v_apflora_taxonomies as with objartwert as (
    select *
    from ae.property_collection_object
    where property_collection_id = 'bdf89414-7b0e-11e8-a170-ab93aeea0aac'
  )
select distinct tax.id as taxonomie_id,
  tax.name as taxonomie_name,
  ae.object.id,
  cast(ae.object.properties->>'Taxonomie ID' as INTEGER) as taxid,
  ae.object.properties->>'Familie' as familie,
  ae.object.name as artname,
  coalesce(
    cast(objartwert.properties->>'Artwert' as INTEGER),
    cast(synobjartwert.properties->>'Artwert' as INTEGER),
    cast(synobjartwert2.properties->>'Artwert' as INTEGER)
  ) as artwert
from ae.object
  inner join ae.taxonomy tax on tax.id = ae.object.taxonomy_id
  left join ae.synonym synonym
  inner join objartwert synobjartwert on synobjartwert.object_id = synonym.object_id_synonym on ae.object.id = synonym.object_id -- account for both ways an object can be defined as synonym
  left join ae.synonym synonym2
  inner join objartwert synobjartwert2 on synobjartwert2.object_id = synonym2.object_id_synonym on ae.object.id = synonym2.object_id_synonym
  left join objartwert on objartwert.object_id = ae.object.id
where -- sisf index 2
  taxonomy_id in (
    'aed47d41-7b0e-11e8-b9a5-bd4f79edbcc4',
    'c87f19f2-1b77-11ea-8282-bbc40e20aff6'
  ) -- only lowest hierarchy, not pure structural objects
  and ae.object.properties->>'Taxonomie ID' is not null
order by tax.name,
  ae.object.name;