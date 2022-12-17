import React, { useCallback, useContext } from 'react'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import styled from '@emotion/styled'
import { observer } from 'mobx-react-lite'

import storeContext from '../../../../../../storeContext'

const Container = styled.div`
  margin-bottom: 16px;
`
const Label = styled(FormControlLabel)`
  height: 30px;
  min-height: 30px;
  > span {
    font-weight: 500;
    line-height: 1em;
  }
`

const AllPcoChooser = ({ properties, pcName }) => {
  const store = useContext(storeContext)
  const { pcoProperties, addPcoProperty, removePcoProperty } = store.export

  const onCheck = useCallback(
    (event, isChecked) => {
      if (isChecked) {
        return properties.forEach((p) => {
          const pcname = pcName
          const pname = p.property
          addPcoProperty({ pcname, pname })
        })
      }
      properties.forEach((p) =>
        removePcoProperty({ pcname: pcName, pname: p.property }),
      )
    },
    [addPcoProperty, pcName, properties, removePcoProperty],
  )

  const checkedArray = properties.map(
    (p) =>
      pcoProperties.filter((x) => x.pcname === pcName && x.pname === p.property)
        .length > 0,
  )
  const checked = checkedArray.length > 0 && !checkedArray.includes(false)

  return (
    <Container>
      <Label
        control={
          <Checkbox color="primary" checked={checked} onChange={onCheck} />
        }
        label="alle"
      />
    </Container>
  )
}

export default observer(AllPcoChooser)
