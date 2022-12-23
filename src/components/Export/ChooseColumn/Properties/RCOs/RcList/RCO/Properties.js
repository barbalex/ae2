import React from 'react'

import Chooser from './Chooser'

const RcoProperties = ({ properties, relationtype }) =>
  properties.map((p) => (
    <Chooser
      key={`${p.property ?? 'Beziehungspartner'}${p.jsontype ?? 'Boolaen'}`}
      pcname={p.pcname}
      relationtype={relationtype}
      pname={p.property ?? 'Beziehungspartner'}
      jsontype={p.jsontype ?? 'Boolean'}
      count={p.count}
      propertiesLength={properties.length}
    />
  ))

export default RcoProperties
