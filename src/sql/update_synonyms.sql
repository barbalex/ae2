-- pco_of_object enables joining pcos to objects while considering synonyms but prioritizing the original object
-- 1. if own pco exists, it is listed
-- 2. if no own pco exists but for a synonym: pco of synonym is listed (no priorisation if multiple exist)
-- 3. no pco > no row
-- This would have to be updated after every update of objects and pcos
CREATE TABLE ae.pco_of_object (
  object_id uuid NOT NULL REFERENCES ae.object (id) ON DELETE CASCADE ON UPDATE CASCADE,
  property_collection_id uuid NOT NULL REFERENCES ae.property_collection_object (id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY (object_id, property_collection_id)
);

-- 1. truncate pco_of_object
-- 2. insert data from pcos
-- 3. insert data from synonyms of objects listed in pcos, on conflict do nothing

-- 1. truncate pco_of_object
truncate table ae.pco_of_object;
-- 2. insert data from pcos
insert into 

SELECT
  id
FROM
  ae.object
WHERE
  id NOT IN (
    SELECT
      object_id
    FROM
      ae.synonym);

SELECT
  *
FROM
  ae.synonym;

SELECT
  *
FROM
  ae.synonym
WHERE
  object_id = object_id_synonym;

