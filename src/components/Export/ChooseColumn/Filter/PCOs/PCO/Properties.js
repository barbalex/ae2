import React, { useContext } from 'react'
import styled from '@emotion/styled'
import groupBy from 'lodash/groupBy'
import { useQuery, gql } from '@apollo/client'
import { observer } from 'mobx-react-lite'

import Property from './Property'
import storeContext from '../../../../../../storeContext'
import Spinner from '../../../../../shared/Spinner'

const SpinnerContainer = styled.div`
  padding-top: 15px;
  width: 100%;
`

// TODO: query only for this pc
const propsByTaxQuery = gql`
  query propsByTaxDataQueryForFilterPCO(
    $queryExportTaxonomies: Boolean!
    $exportTaxonomies: [String]
  ) {
    pcoPropertiesByTaxonomiesFunction(taxonomyNames: $exportTaxonomies)
      @include(if: $queryExportTaxonomies) {
      nodes {
        propertyCollectionName
        propertyName
        jsontype
        count
      }
    }
  }
`

const Properties = ({ columns, pc }) => {
  const store = useContext(storeContext)
  const exportTaxonomies = store.export.taxonomies.toJSON()

  const { data, error, loading } = useQuery(propsByTaxQuery, {
    variables: {
      exportTaxonomies,
      queryExportTaxonomies: exportTaxonomies.length > 0,
    },
  })

  const pcoProperties = data?.pcoPropertiesByTaxonomiesFunction?.nodes ?? []
  const pcoPropertiesByPropertyCollection = groupBy(
    pcoProperties,
    'propertyCollectionName',
  )
  const properties = pcoPropertiesByPropertyCollection?.[pc] ?? []

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
      key={`${field.propertyName}${field.jsontype}`}
      pcname={field.propertyCollectionName}
      pname={field.propertyName}
      jsontype={field.jsontype}
      columns={columns}
      propertiesLength={properties.length}
    />
  ))
}

export default observer(Properties)
