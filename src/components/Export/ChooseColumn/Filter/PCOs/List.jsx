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
  query propsByTaxDataQueryForFilterPCOs($exportTaxonomies: [String!]) {
    pcoPropertiesByTaxonomiesCountPerPc(exportTaxonomies: $exportTaxonomies) {
      nodes {
        name
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
    },
  })
  // TODO:
  const nodes = data?.pcoPropertiesByTaxonomiesCountPerPc?.nodes ?? []

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
      {nodes.map(({ name, count }) => (
        <PCO key={name} pc={name} />
      ))}
    </ErrorBoundary>
  )
}

export default observer(PcosCardList)
