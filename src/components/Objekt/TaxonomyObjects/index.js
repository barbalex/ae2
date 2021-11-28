import React from 'react'
import sortBy from 'lodash/sortBy'

import TaxonomyObject from './TaxonomyObject'

const Objekt = ({ objects, stacked = false }) =>
  sortBy(objects, (tO) => tO?.taxonomyByTaxonomyId?.name ?? '(Name fehlt)').map(
    (o) => <TaxonomyObject key={o.id} objekt={o} showLink stacked={stacked} />,
  )

export default Objekt
