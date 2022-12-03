-- pco_of_object enables joining pcos to objects while considering synonyms but prioritizing the original object
-- 1. if own pco exists, it is listed
-- 2. if no own pco exists but for a synonym: pco of synonym is listed (no priorisation if multiple exist)
-- 3. no pco > no row?
-- This would have to be updated after every update of pcos (and objects?)
CREATE TABLE ae.pco_of_object (
  object_id uuid NOT NULL REFERENCES ae.object (id) ON DELETE CASCADE ON UPDATE CASCADE,
  pco_id uuid NOT NULL REFERENCES ae.property_collection_object (id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY (object_id, pco_id)
);

CREATE INDEX ON ae.pco_of_object USING btree (object_id);

CREATE INDEX ON ae.pco_of_object USING btree (pco_id);

-- The plan:
-- 1. truncate pco_of_object
-- 2. insert data from pcos
-- 3. insert data from synonyms of objects listed in pcos, on conflict do nothing
--
-- 1. truncate pco_of_object
TRUNCATE TABLE ae.pco_of_object;

-- 2. insert data from pcos
INSERT INTO ae.pco_of_object (object_id, pco_id)
SELECT
  object_id,
  id
FROM
  ae.property_collection_object;

-- 97'064 rows
--
-- 3. insert data from synonyms of objects listed in pcos, on conflict do nothing
INSERT INTO ae.pco_of_object (object_id, pco_id) (
  SELECT
    synonym.object_id_synonym,
    pco.id
  FROM
    ae.property_collection_object pco
    INNER JOIN ae.synonym synonym ON synonym.object_id = pco.object_id
UNION
SELECT
  synonym.object_id,
  pco.id
FROM
  ae.property_collection_object pco
  INNER JOIN ae.synonym synonym ON synonym.object_id_synonym = pco.object_id)
ON CONFLICT
  DO NOTHING;

-- 91'137 rows
--
--
