import React, { useCallback, useContext } from 'react'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'

import ComparatorSelect from '../../ComparatorSelect'
import storeContext from './../../../../../../storeContext'

const Container = styled.div`
  display: flex;
  flew-wrap: wrap;
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

const Comparator = ({ comparator, taxname, pname, value }) => {
  const store = useContext(storeContext)
  const { setTaxFilters } = store.export

  const onChange = useCallback(
    (event) =>
      setTaxFilters({
        taxname,
        pname,
        comparator: event.target.value || 'ILIKE',
        value,
      }),
    [setTaxFilters, taxname, pname, value],
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

export default observer(Comparator)
