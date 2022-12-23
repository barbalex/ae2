import React from 'react'

import Chooser from './Chooser'

const RcoProperties = ({ properties, columns, relationtype }) => {
  const propertiesLength = properties.length

  console.log('RcoProperties properties:', { properties, columns })

  return properties.map((p) => (
    <Chooser
      key={`${p.property ?? 'Beziehungspartner'}${p.jsontype ?? 'Boolaen'}`}
      pcname={p.pcname}
      relationtype={relationtype}
      pname={p.property ?? 'Beziehungspartner'}
      jsontype={p.jsontype ?? 'Boolean'}
      count={p.count}
      columns={columns}
      propertiesLength={propertiesLength}
    />
  ))
}

export default RcoProperties
