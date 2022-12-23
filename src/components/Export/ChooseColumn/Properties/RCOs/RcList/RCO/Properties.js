import React from 'react'

import Chooser from './Chooser'

const RcoProperties = ({ properties, columns }) => {
  const propertiesLength = properties.length

  return properties.map((p) => (
    <Chooser
      key={`${p.property ?? 'Beziehungspartner'}${p.jsontype ?? 'Boolaen'}`}
      pcname={p.pcname}
      relationtype={p.relationType}
      pname={p.property ?? 'Beziehungspartner'}
      jsontype={p.jsontype ?? 'Boolean'}
      count={p.count}
      columns={columns}
      propertiesLength={propertiesLength}
    />
  ))
}

export default RcoProperties
