import React, { useContext } from 'react'
import { useQuery, gql } from '@apollo/client'
import groupBy from 'lodash/groupBy'
import styled from '@emotion/styled'
import { observer } from 'mobx-react-lite'

import PCO from './PCO'
import storeContext from '../../../../../storeContext'
import Spinner from '../../../../shared/Spinner'

const SpinnerContainer = styled.div`
  padding-top: 15px;
`

const propsByTaxQuery = gql`
  query propsByTaxDataQueryForPropertiesPCOs(
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

const PCOs = () => {
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
  const pcNames = Object.keys(pcoPropertiesByPropertyCollection)

  if (error) return `Error fetching data: ${error.message}`

  if (loading) {
    return (
      <SpinnerContainer>
        <Spinner message="" />
      </SpinnerContainer>
    )
  }

  return pcNames.map((name) => <PCO key={name} pc={name} />)
}

export default observer(PCOs)
