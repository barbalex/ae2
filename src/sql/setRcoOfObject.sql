-- rco_of_object enables joining rcos to objects while considering synonyms but prioritizing the original object
-- 1. if own rco exists, it is listed
-- 2. if no own rco exists but for a synonym: rco of synonym is listed (no priorisation if multiple exist)
-- 3. no rco > no row?
-- This would have to be updated after every update of rcos (and objects?)
CREATE TABLE ae.rco_of_object (
  object_id uuid NOT NULL REFERENCES ae.object (id) ON DELETE CASCADE ON UPDATE CASCADE,
  rco_id uuid NOT NULL REFERENCES ae.relation (id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY (object_id, rco_id)
);

CREATE INDEX ON ae.rco_of_object USING btree (object_id);

CREATE INDEX ON ae.rco_of_object USING btree (rco_id);

-- The plan:
-- 1. truncate rco_of_object
-- 2. insert data from rcos
-- 3. insert data from synonyms of objects listed in rcos, on conflict do nothing
--
-- 1. truncate rco_of_object
TRUNCATE TABLE ae.rco_of_object;

-- 2. insert data from rcos
INSERT INTO ae.rco_of_object (object_id, rco_id)
SELECT
  object_id,
  id
FROM
  ae.relation;

-- 164'229 rows
--
-- 3. insert data from synonyms of objects listed in rcos, on conflict do nothing
INSERT INTO ae.rco_of_object (object_id, rco_id) (
  SELECT
    synonym.object_id_synonym,
    rco.id
  FROM
    ae.relation rco
    INNER JOIN ae.synonym synonym ON synonym.object_id = rco.object_id
UNION
SELECT
  synonym.object_id,
  rco.id
FROM
  ae.relation rco
  INNER JOIN ae.synonym synonym ON synonym.object_id_synonym = rco.object_id)
ON CONFLICT
  DO NOTHING;

-- 108'692 rows
--
--
