import React, { useContext } from 'react'
import styled from '@emotion/styled'
import groupBy from 'lodash/groupBy'
import { useQuery, gql } from '@apollo/client'
import { observer } from 'mobx-react-lite'

import PCO from './PCO'
import storeContext from '../../../../../storeContext'
import ErrorBoundary from '../../../../shared/ErrorBoundary'
import Spinner from '../../../../shared/Spinner'

const ErrorContainer = styled.div`
  padding: 5px;
`
const SpinnerContainer = styled.div`
  padding-top: 15px;
`

// TODO: load most of this data later, when user clicks on PCO
const query = gql`
  query propsByTaxDataQueryForFilterPCOs(
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

const PcosCardList = () => {
  const store = useContext(storeContext)
  const exportTaxonomies = store.export.taxonomies.toJSON()

  const { data, error, loading } = useQuery(query, {
    variables: {
      exportTaxonomies,
      queryExportTaxonomies: exportTaxonomies.length > 0,
    },
  })
  // TODO:
  const pcoProperties = data?.pcoPropertiesByTaxonomiesFunction?.nodes ?? []
  const pcoPropertiesByPropertyCollection = groupBy(
    pcoProperties,
    'propertyCollectionName',
  )

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
      {Object.keys(pcoPropertiesByPropertyCollection).map((pc) => (
        <PCO key={pc} pc={pc} />
      ))}
    </ErrorBoundary>
  )
}

export default observer(PcosCardList)
