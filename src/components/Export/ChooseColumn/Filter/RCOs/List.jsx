import React, { useContext } from 'react'
import styled from '@emotion/styled'
import groupBy from 'lodash/groupBy'
import { useQuery, gql } from '@apollo/client'
import { observer } from 'mobx-react-lite'

import RCO from './RCO'
import storeContext from '../../../../../storeContext'
import ErrorBoundary from '../../../../shared/ErrorBoundary'
import Spinner from '../../../../shared/Spinner'

const ErrorContainer = styled.div`
  padding: 5px;
`
const SpinnerContainer = styled.div`
  padding-top: 15px;
`

const propsByTaxQuery = gql`
  query propsByTaxDataQueryForFilterRCOs(
    $queryExportTaxonomies: Boolean!
    $exportTaxonomies: [String]
  ) {
    rcoPropertiesByTaxonomiesFunction(taxonomyNames: $exportTaxonomies)
      @include(if: $queryExportTaxonomies) {
      nodes {
        propertyCollectionName
        relationType
        propertyName
        jsontype
        count
      }
    }
  }
`

const RcosCardList = () => {
  const store = useContext(storeContext)
  const exportTaxonomies = store.export.taxonomies.toJSON()

  const { data, error, loading } = useQuery(propsByTaxQuery, {
    variables: {
      exportTaxonomies,
      queryExportTaxonomies: exportTaxonomies.length > 0,
    },
  })

  const rcoProperties = data?.rcoPropertiesByTaxonomiesFunction?.nodes ?? []

  const rcoPropertiesByPropertyCollection = groupBy(rcoProperties, (x) => {
    if (x.propertyCollectionName.includes(x.relationType)) {
      return x.propertyCollectionName
    }
    return `${x.propertyCollectionName}: ${x.relationType}`
  })

  if (error) {
    return (
      <ErrorContainer>`Error loading data: ${error.message}`</ErrorContainer>
    )
  }

  if (loading) {
    return (
      <SpinnerContainer>
        <Spinner message="" />
      </SpinnerContainer>
    )
  }

  return (
    <ErrorBoundary>
      {Object.keys(rcoPropertiesByPropertyCollection).map((pc) => (
        <RCO key={pc} pc={pc} />
      ))}
    </ErrorBoundary>
  )
}

export default observer(RcosCardList)
