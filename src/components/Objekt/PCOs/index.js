import React from 'react'
import sortBy from 'lodash/sortBy'

import PCO from './PCO'

const PCOs = ({ pCOs, relations, stacked }) =>
  sortBy(
    pCOs,
    (pCO) =>
      pCO?.propertyCollectionByPropertyCollectionId?.name ?? '(Name fehlt)',
  ).map((pCO) => (
    <PCO
      key={pCO.propertyCollectionId}
      pCO={pCO}
      relations={relations.filter(
        (r) => r.propertyCollectionId === pCO.propertyCollectionId,
      )}
      stacked={stacked}
    />
  ))

export default PCOs
