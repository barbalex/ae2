//@flow
import React from 'react'
import TextField from 'material-ui/TextField'
import styled from 'styled-components'
import compose from 'recompose/compose'
import withHandlers from 'recompose/withHandlers'
import { withApollo } from 'react-apollo'

import exportTaxFiltersMutation from '../../exportTaxFiltersMutation'
import readableType from '../../../../modules/readableType'

const Container = styled.div`
  flex-basis: 150px;
  flex-grow: 1;
`

const floatingLabelStyle = {
  color: 'rgba(0, 0, 0, 0.5)',
}

const enhance = compose(
  withApollo,
  withHandlers({
    onChange: ({ taxname, pname, comparator, client }) => event => {
      const value = event.target.value
      let comparatorValue = comparator
      if (!comparator && value) comparatorValue = 'ILIKE'
      if (!value) comparatorValue = null
      client.mutate({
        mutation: exportTaxFiltersMutation,
        variables: {
          taxname,
          pname,
          comparator: comparatorValue,
          value,
        },
      })
    },
  })
)

const TaxFieldValue = ({
  taxname,
  pname,
  value,
  jsontype,
  properties,
  onChange,
}: {
  taxname: string,
  pname: string,
  value: string,
  jsontype: string,
  properties: Array<Object>,
  onChange: () => {},
}) => (
  <Container>
    <TextField
      floatingLabelFixed
      floatingLabelText={`${pname} (${readableType(jsontype)})`}
      floatingLabelStyle={floatingLabelStyle}
      value={value || ''}
      fullWidth
      onChange={onChange}
    />
  </Container>
)

export default enhance(TaxFieldValue)
