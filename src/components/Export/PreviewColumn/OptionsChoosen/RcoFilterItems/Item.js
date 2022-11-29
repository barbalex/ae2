import React, { useCallback, useContext } from 'react'
import styled from '@emotion/styled'
import { observer } from 'mobx-react-lite'

import booleanToJaNein from '../../../../../modules/booleanToJaNein'
import storeContext from '../../../../../storeContext'

const FilterValueSpan = styled.span`
  background-color: #dadada;
  padding: 1px 8px;
  margin-left: 5px;
  border-radius: 3px;
`
const ResetSpan = styled.span`
  margin-left: 8px;
  font-weight: 100;
  font-style: italic;
  cursor: pointer;
  text-decoration: underline dotted rgba(0, 0, 0, 0.3);
`

const ExportRcoFilterListItem = ({ filter }) => {
  const { pcname, relationtype, pname, comparator, value } = filter
  const store = useContext(storeContext)
  const { setRcoFilters } = store.export

  const onClick = useCallback(
    () =>
      setRcoFilters({
        pcname,
        relationtype,
        pname,
        comparator: '',
        value: '',
      }),
    [pcname, pname, relationtype, setRcoFilters],
  )

  return (
    <li>
      {`${pcname}: ${pname} ${comparator ? `${comparator}` : ''}`}
      <FilterValueSpan>
        {typeof value === 'boolean' ? booleanToJaNein(value) : value}
      </FilterValueSpan>
      <ResetSpan onClick={onClick}>zurücksetzen</ResetSpan>
    </li>
  )
}

export default observer(ExportRcoFilterListItem)
