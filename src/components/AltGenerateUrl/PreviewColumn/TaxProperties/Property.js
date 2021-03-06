import React, { useCallback, useContext } from 'react'
import styled from 'styled-components'

import mobxStoreContext from '../../../../mobxStoreContext'

const ResetSpan = styled.span`
  margin-left: 8px;
  font-weight: 100;
  font-style: italic;
  cursor: pointer;
  text-decoration: underline dotted rgba(0, 0, 0, 0.3);
`

const TaxProperties = ({ taxname, pname }) => {
  const mobxStore = useContext(mobxStoreContext)
  const { removeTaxProperty } = mobxStore.export

  const onClick = useCallback(() => {
    removeTaxProperty({
      taxname,
      pname,
    })
  }, [pname, removeTaxProperty, taxname])

  return (
    <li>
      {`${taxname}: ${pname}`}
      <ResetSpan onClick={onClick}>zurücksetzen</ResetSpan>
    </li>
  )
}

export default TaxProperties
