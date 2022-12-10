import React from 'react'

import ExportType from './ExportType'

const exportTypes = ['Arten', 'Lebensräume']

const ExportTypes = () =>
  exportTypes.map((type) => <ExportType key={type} type={type} />)

export default ExportTypes
