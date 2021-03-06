import React from 'react'

import Item from './Item'

const ExportTaxPropertiesListItems = ({ taxProperties }) => {
  return taxProperties.map(p => (
    <Item key={`${p.taxname}: ${p.pname}`} properties={p} />
  ))
}

export default ExportTaxPropertiesListItems
