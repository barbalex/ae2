import React, { useContext } from 'react'
import styled from '@emotion/styled'
import { useQuery, gql } from '@apollo/client'
import { observer } from 'mobx-react-lite'

import Property from './Property'
import storeContext from '../../../../../../storeContext'
import Spinner from '../../../../../shared/Spinner'

const SpinnerContainer = styled.div`
  padding-top: 15px;
  width: 100%;
`

const query = gql`
  query propsByTaxDataQueryForFilterPCO(
    $exportTaxonomies: [String]
    $pcName: String!
  ) {
    pcoPropertiesByTaxonomiesAndPc(
      taxonomyNames: $exportTaxonomies
      pcName: $pcName
    ) {
      totalCount
      nodes {
        property
        type
      }
    }
  }
`

const Properties = ({ columns, pc }) => {
  const store = useContext(storeContext)
  const exportTaxonomies = store.export.taxonomies.toJSON()

  const { data, error, loading } = useQuery(query, {
    variables: {
      exportTaxonomies,
      pcName: pc,
    },
  })

  const properties = data?.pcoPropertiesByTaxonomiesAndPc?.nodes ?? []

  if (error) {
    return `Error loading data: ${error.message}`
  }

  if (loading) {
    return (
      <SpinnerContainer>
        <Spinner message="" />
      </SpinnerContainer>
    )
  }

  return properties.map((field) => (
    <Property
      key={`${field.property}${field.type}`}
      pcname={pc}
      pname={field.property}
      jsontype={field.type}
      columns={columns}
      propertiesLength={properties.length}
    />
  ))
}

export default observer(Properties)
