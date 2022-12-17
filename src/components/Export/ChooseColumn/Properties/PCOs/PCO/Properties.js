import React from 'react'

import Chooser from './Chooser'

const PCO = ({ properties, columns, pcName }) =>
  properties.map((p) => (
    <Chooser
      key={`${p.property}${p.type}`}
      pcname={pcName}
      pname={p.property}
      jsontype={p.type}
      columns={columns}
      propertiesLength={properties.length}
    />
  ))

export default PCO
