import React, { useContext } from 'react'
import styled from '@emotion/styled'
import { observer } from 'mobx-react-lite'
import { getSnapshot } from 'mobx-state-tree'
import { withResizeDetector } from 'react-resize-detector'

import Comparator from './Comparator' 
import Value from './Value'
import Checkbox from './Checkbox'
import storeContext from '../../../../../../../storeContext' 

const Container = styled.div`
  display: flex;
  align-content: stretch;
  padding: 4px 16px;
  width: ${(props) => `${props['data-width']}%`};
  > div {
    height: auto;
  }
`

const PcoProperty = ({
  pcname,
  pname,
  jsontype,
  width,
  columns,
  propertiesLength,
}) => {
  const store = useContext(storeContext)
  const { pcoFilters: pcoFiltersPassed } = store.export
  const pcoFilters = getSnapshot(pcoFiltersPassed)

  const pcoFilter = pcoFilters.find(
    (x) => x.pcname === pcname && x.pname === pname,
  ) || { comparator: null, value: null }
  const { comparator, value } = pcoFilter

  const containerWidth = propertiesLength === 1 ? 100 : 100 / columns

  if (jsontype === 'Boolean') {
    return (
      <Container data-width={containerWidth}>
        <Checkbox pcname={pcname} pname={pname} value={value} />
      </Container>
    )
  }

  return (
    <Container data-width={containerWidth}>
      <Value
        key={`${pcname}/${pname}/${jsontype}/${value}`}
        pcname={pcname}
        pname={pname}
        value={value}
        comparator={comparator}
        jsontype={jsontype}
        width={width - 32}
      />
      {value !== undefined && value !== null && value !== ' ' && (
        <Comparator
          pcname={pcname}
          pname={pname}
          comparator={comparator}
          value={value}
        />
      )}
    </Container>
  )
}

export default withResizeDetector(observer(PcoProperty))
