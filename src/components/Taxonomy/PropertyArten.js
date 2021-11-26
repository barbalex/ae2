import React, { useState, useCallback } from 'react'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import styled from 'styled-components'
import format from 'date-fns/format'
import { useApolloClient } from '@apollo/client'

import updateTaxonomyMutationArten from './updateTaxonomyMutationArten'
import onBlurArten from './onBlurArten'

const Container = styled.div`
  margin: 5px 0;
`
const StyledFormControl = styled(FormControl)`
  padding-bottom: 19px !important;
  > div:before {
    border-bottom-color: rgba(0, 0, 0, 0.1) !important;
  }
`

const Property = ({ taxonomy, field, label, type = 'text', disabled }) => {
  const client = useApolloClient()

  const [value, setValue] = useState(taxonomy[field] || '')
  const onChange = useCallback((event) => setValue(event.target.value), [])

  const [fieldError, setFieldError] = useState()
  const onBlur = useCallback(
    () =>
      onBlurArten({
        client,
        field,
        taxonomy,
        value,
        prevValue: taxonomy[field],
        setFieldError,
      }),
    [client, field, taxonomy, value],
  )

  return (
    <Container>
      <StyledFormControl
        fullWidth
        disabled={disabled}
        error={fieldError}
        aria-describedby={`${label}ErrorText`}
        variant="standard"
      >
        <TextField
          autoFocus={label === 'Name' && !value}
          label={label}
          value={
            field === 'lastUpdated' && value
              ? format(new Date(value), 'dd.MM.yyyy')
              : value
          }
          onChange={onChange}
          onBlur={onBlur}
          fullWidth
          multiline={type === 'number' ? false : true}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          disabled={!!disabled}
          type={type}
          variant="standard"
        />
        {!!fieldError && (
          <FormHelperText id={`${label}ErrorText`}>
            {fieldError?.message}
          </FormHelperText>
        )}
      </StyledFormControl>
    </Container>
  )
}

export default Property
