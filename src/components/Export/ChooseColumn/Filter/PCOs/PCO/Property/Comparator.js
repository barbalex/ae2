import React, { useCallback, useContext } from 'react'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import styled from '@emotion/styled'
import { observer } from 'mobx-react-lite'

import ComparatorSelect from '../../../ComparatorSelect'
import storeContext from '../../../../../../../storeContext'

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-basis: 150px;
  flex-shrink: 0;
  flex-grow: 1;
`
const StyledFormControl = styled(FormControl)`
  margin: 0 !important;
  width: 100%;
  min-width: 120px;
  > label {
    padding-left: 8px;
  }
`

const PcoComparator = ({ pcname, pname, value, comparator }) => {
  const store = useContext(storeContext)
  const { setPcoFilter } = store.export

  const onChange = useCallback(
    (event) => {
      setPcoFilter({ pcname, pname, comparator: event.target.value, value })
    },
    [pcname, pname, setPcoFilter, value],
  )

  return (
    <Container>
      <StyledFormControl variant="standard">
        <InputLabel htmlFor="v-op">Vergleichs-Operator</InputLabel>
        <ComparatorSelect comparator={comparator} onChange={onChange} />
      </StyledFormControl>
    </Container>
  )
}

export default observer(PcoComparator)
