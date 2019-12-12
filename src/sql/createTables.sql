-- this one first because of references to it
DROP TABLE IF EXISTS ae.user CASCADE;
CREATE TABLE ae.user (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  name text UNIQUE,
  email text UNIQUE,
  -- is this still used?
  role name NOT NULL DEFAULT 'org_writer' check (length(role) < 512),
  pass text NOT NULL DEFAULT 'secret' check (length(pass) > 5),
  CONSTRAINT proper_email CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);
CREATE INDEX ON ae.user USING btree (id);
CREATE INDEX ON ae.user USING btree (name);

DROP TABLE IF EXISTS ae.organization CASCADE;
CREATE TABLE ae.organization (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  name text UNIQUE NOT NULL,
  links text[] DEFAULT NULL,
  contact UUID NOT NULL REFERENCES ae.user (id) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX ON ae.organization USING btree (name);
CREATE INDEX ON ae.organization USING btree (id);
CREATE INDEX ON ae.organization USING btree (contact);

-- once: ALTER TABLE ae.organization ADD CONSTRAINT fk_contact FOREIGN KEY (contact) REFERENCES ae.user (id)

CREATE TYPE taxonomy_type AS ENUM ('Art', 'Lebensraum');

DROP TABLE IF EXISTS ae.taxonomy CASCADE;
CREATE TABLE ae.taxonomy (
  -- gets existing guids
  id UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  type taxonomy_type DEFAULT NULL,
  name text UNIQUE DEFAULT NULL,
  description text DEFAULT NULL,
  links text[] DEFAULT NULL,
  last_updated date DEFAULT NULL,
  organization_id UUID DEFAULT NULL REFERENCES ae.organization (id) ON DELETE SET NULL ON UPDATE CASCADE,
  imported_by UUID NOT NULL REFERENCES ae.user (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  terms_of_use text DEFAULT NULL,
  habitat_label varchar(50) DEFAULT NULL,
  habitat_comments text DEFAULT NULL,
  habitat_nr_fns_min integer DEFAULT NULL,
  habitat_nr_fns_max integer DEFAULT NULL,
  CONSTRAINT proper_links CHECK (length(regexp_replace(array_to_string(links, ''),'((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)',''))=0)
);
CREATE INDEX ON ae.taxonomy USING btree (id);
CREATE INDEX ON ae.taxonomy USING btree (type);
CREATE INDEX ON ae.taxonomy USING btree (name);
CREATE INDEX ON ae.taxonomy USING btree (organization_id);
CREATE INDEX ON ae.taxonomy USING btree (imported_by);

--once:
--alter table ae.taxonomy drop column is_category_standard;

DROP TABLE IF EXISTS ae.object CASCADE;
CREATE TABLE ae.object (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  taxonomy_id UUID NOT NULL REFERENCES ae.taxonomy (id) ON DELETE CASCADE ON UPDATE CASCADE,
  -- need to temporarily turn off this reference because it is violated during import
  parent_id UUID DEFAULT NULL,-- REFERENCES ae.object (id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text,
  properties jsonb DEFAULT NULL,
  -- UUID's are by definition lowercase
  -- postgresql converts them to it
  -- see: https://www.postgresql.org/docs/9.6/static/datatype-uuid.html
  -- but UUID's generated by Access are uppercase!!!!
  -- so keep them around in the original form
  id_old text DEFAULT NULL
);
--once: alter table ae.object drop column category
--once: ALTER TABLE ae.object ADD CONSTRAINT fk_parent FOREIGN KEY (parent_id) REFERENCES ae.object (id);
-- once: ALTER TABLE ae.object ALTER COLUMN name DROP NOT NULL
CREATE INDEX ON ae.object USING btree (id);
CREATE INDEX ON ae.object USING btree (name);
CREATE INDEX ON ae.object USING btree (taxonomy_id);
CREATE INDEX ON ae.object USING btree (parent_id);
CREATE INDEX ON ae.object USING gin(properties);


-- ae.object to ae.object relationship
-- best to add every relationship twice, see: https://stackoverflow.com/a/17128606/712005
DROP TABLE IF EXISTS ae.synonym CASCADE;
CREATE TABLE ae.synonym (
  object_id UUID NOT NULL REFERENCES ae.object (id) ON DELETE CASCADE ON UPDATE CASCADE,
  object_id_synonym UUID NOT NULL REFERENCES ae.object (id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY (object_id, object_id_synonym)
);
CREATE INDEX ON ae.synonym USING btree (object_id);
CREATE INDEX ON ae.synonym USING btree (object_id_synonym);

DROP TABLE IF EXISTS ae.property_collection CASCADE;
CREATE TABLE ae.property_collection (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  -- later add UNIQUE
  name text DEFAULT NULL,
  description text DEFAULT NULL,
  links text[] DEFAULT NULL,
  combining boolean DEFAULT FALSE,
  organization_id UUID DEFAULT NULL REFERENCES ae.organization (id) ON DELETE SET NULL ON UPDATE CASCADE,
  last_updated date DEFAULT NULL,
  terms_of_use text DEFAULT NULL,
  imported_by UUID NOT NULL REFERENCES ae.user (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  pc_of_origin UUID DEFAULT NULL REFERENCES ae.property_collection (id) ON UPDATE CASCADE ON DELETE CASCADE,
  -- this is only for import because pc_of_origin are saved as names
  pc_of_origin_name text DEFAULT NULL
  --CONSTRAINT proper_links CHECK (length(regexp_replace(array_to_string(links, ''),'((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)',''))=0)
);
-- once: ALTER TABLE ae.property_collection ADD UNIQUE (name);
-- once on notebook:
--ALTER TABLE ae.property_collection alter column name drop not null;
--ALTER TABLE ae.property_collection alter column organization_id drop not null;
alter table ae.property_collection drop column pc_of_origin;
alter table ae.property_collection drop column pc_of_origin_name;

--alter table ae.property_collection drop pc_of_origin_name;

CREATE INDEX ON ae.property_collection USING btree (id);
CREATE INDEX ON ae.property_collection USING btree (name);
CREATE INDEX ON ae.property_collection USING btree (combining);
CREATE INDEX ON ae.property_collection USING btree (organization_id);
CREATE INDEX ON ae.property_collection USING btree (imported_by);

DROP TABLE IF EXISTS ae.property_collection_object CASCADE;
CREATE TABLE ae.property_collection_object (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  object_id UUID REFERENCES ae.object (id) ON DELETE CASCADE ON UPDATE CASCADE,
  property_collection_id UUID REFERENCES ae.property_collection (id) ON DELETE CASCADE ON UPDATE CASCADE,
  property_collection_of_origin UUID DEFAULT NULL REFERENCES ae.property_collection (id) ON UPDATE CASCADE ON DELETE CASCADE,
  -- this is only for import because property_collection_of_origin are saved as names
  property_collection_of_origin_name text DEFAULT NULL,
  properties jsonb DEFAULT NULL,
  UNIQUE (object_id, property_collection_id)
);
CREATE INDEX ON ae.property_collection_object USING btree (id);
CREATE INDEX ON ae.property_collection_object USING btree (object_id);
CREATE INDEX ON ae.property_collection_object USING btree (property_collection_id);
CREATE INDEX ON ae.property_collection_object USING btree (property_collection_of_origin);
CREATE INDEX ON ae.property_collection_object USING gin(properties);
-- once
--alter table ae.property_collection_object add column property_collection_of_origin UUID DEFAULT NULL REFERENCES ae.property_collection (id) ON UPDATE CASCADE ON DELETE CASCADE;
--alter table ae.property_collection_object add column property_collection_of_origin_name text DEFAULT NULL;

--update ae.property_collection set property_collection_of_origin = null;

-- only do on import:
/*
update ae.property_collection_object as x
  set property_collection_of_origin = y.id
  from ae.property_collection as y
  where
    y.name = x.property_collection_of_origin_name;
*/

DROP TABLE IF EXISTS ae.relation CASCADE;
CREATE TABLE ae.relation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  property_collection_id UUID NOT NULL REFERENCES ae.property_collection (id) ON DELETE CASCADE ON UPDATE CASCADE,
  object_id UUID NOT NULL REFERENCES ae.object (id) ON DELETE CASCADE ON UPDATE CASCADE,
  object_id_relation UUID NOT NULL REFERENCES ae.object (id) ON DELETE CASCADE ON UPDATE CASCADE,
  property_collection_of_origin UUID DEFAULT NULL REFERENCES ae.property_collection (id) ON UPDATE CASCADE ON DELETE CASCADE,
  relation_type text NOT NULL,
  properties jsonb DEFAULT NULL,
  UNIQUE (property_collection_id, object_id, object_id_relation, relation_type)
);
CREATE INDEX ON ae.relation USING btree (id);
CREATE INDEX ON ae.relation USING btree (property_collection_id);
CREATE INDEX ON ae.relation USING btree (object_id);
CREATE INDEX ON ae.relation USING btree (object_id_relation);
CREATE INDEX ON ae.relation USING btree (property_collection_of_origin);
CREATE INDEX ON ae.relation USING btree (relation_type);
CREATE INDEX ON ae.relation USING gin(properties);
--alter table ae.relation add column property_collection_of_origin UUID DEFAULT NULL REFERENCES ae.property_collection (id) ON UPDATE CASCADE ON DELETE CASCADE;

DROP TABLE IF EXISTS ae.role CASCADE;
CREATE TABLE ae.role (
  name text PRIMARY KEY
);
CREATE INDEX ON ae.role USING btree (name);

DROP TABLE IF EXISTS ae.organization_user;
CREATE TABLE ae.organization_user (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  organization_id UUID REFERENCES ae.organization (id) ON DELETE CASCADE ON UPDATE CASCADE,
  user_id UUID REFERENCES ae.user (id) ON DELETE CASCADE ON UPDATE CASCADE,
  role text REFERENCES ae.role (name) ON DELETE CASCADE ON UPDATE CASCADE,
  unique(organization_id, user_id, role)
);
CREATE INDEX ON ae.organization_user USING btree (id);
CREATE INDEX ON ae.organization_user USING btree (organization_id);
CREATE INDEX ON ae.organization_user USING btree (user_id);
CREATE INDEX ON ae.organization_user USING btree (role);

-- this table is needed for evab api
-- 2019 12: not any more
-- TODO: drop after the change
DROP TABLE IF EXISTS ae.evab_flora_status;
CREATE TABLE ae.evab_flora_status (
  decoded text PRIMARY KEY DEFAULT null,
  encoded text DEFAULT null
);
CREATE INDEX ON ae.evab_flora_status USING btree (decoded);
insert into ae.evab_flora_status (decoded, encoded) values 
  ('eigenständige Art aber im Index nicht enthalten', '?'),
  ('akzeptierter Name', 'A'),
  ('in anderem Taxon eingeschlossener Name', 'E'),
  ('in anderem Taxon eingeschlossener Name. Im Index nicht enthalten', 'f'),
  ('Synonym', 'S'),
  ('zusammenfassender Name. Im Index nicht enthalten', 'y'),
  ('zusammenfassender Name', 'Z');


-- this table is only needed because postgraphql does not pick up
-- the same named function without it
-- see: https://github.com/postgraphql/postgraphql/issues/491
DROP TABLE IF EXISTS ae.tax_properties_by_taxonomy CASCADE;
CREATE TABLE ae.tax_properties_by_taxonomy (
  taxonomy_name text,
  property_name text,
  jsontype text,
  count bigint
);

-- this table is only needed because postgraphql does not pick up
-- the same named function without it
-- see: https://github.com/postgraphql/postgraphql/issues/491
DROP TABLE IF EXISTS ae.pco_properties_by_taxonomy CASCADE;
CREATE TABLE ae.pco_properties_by_taxonomy (
  property_collection_name text,
  property_name text,
  jsontype text,
  count bigint
);

-- this table is only needed because postgraphql does not pick up
-- the same named function without it
-- see: https://github.com/postgraphql/postgraphql/issues/491
DROP TABLE IF EXISTS ae.rco_properties_by_taxonomy CASCADE;
CREATE TABLE ae.rco_properties_by_taxonomy (
  property_collection_name text,
  relation_type text,
  property_name text,
  jsontype text,
  count bigint
);

DROP TABLE IF EXISTS ae.rco_count_by_taxonomy_relation_type CASCADE;
CREATE TABLE ae.rco_count_by_taxonomy_relation_type(
  property_collection_name text,
  relation_type text,
  count bigint
);

DROP TABLE IF EXISTS ae.prop_value CASCADE;
CREATE TABLE ae.prop_value (
  value text
);

