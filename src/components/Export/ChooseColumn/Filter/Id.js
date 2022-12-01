import React, { useCallback, useState, useContext } from 'react'
import TextField from '@mui/material/TextField'
import styled from '@emotion/styled'
import { observer } from 'mobx-react-lite'

import storeContext from '../../../../storeContext'

const IdField = styled(TextField)`
  margin-top: 2px !important;
`

const IdFilterField = () => {
  const store = useContext(storeContext)
  const { setIds } = store.export

  const [value, setValue] = useState('')

  const handleChange = useCallback(
    (event) => {
      const { value } = event.target
      setValue(value)
      // convert values into an array of values, separated by commas
      //const valueForStore = value ? JSON.parse(`"[${event.target.value}]"`) : []
      const valueForStore = value
        ? event.target.value.replace(/\s/g, '').split(',')
        : []
      setIds(valueForStore)
    },
    [setIds],
  )

  return (
    <IdField
      id="id"
      label="id"
      multiline
      maxRows="5"
      value={value}
      onChange={handleChange}
      margin="normal"
      fullWidth
      helperText="Sie können mehrere id's kommagetrennt einfügen"
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck="false"
      variant="standard"
    />
  )
}

export default observer(IdFilterField)
