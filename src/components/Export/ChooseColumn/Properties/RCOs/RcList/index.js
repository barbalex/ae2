import React, { useContext } from 'react'
import { useQuery, gql } from '@apollo/client'
import { observer } from 'mobx-react-lite'
import styled from '@emotion/styled'
import groupBy from 'lodash/groupBy'

import RCO from './RCO'
import storeContext from '../../../../../../storeContext'
import Spinner from '../../../../../shared/Spinner'

const SpinnerContainer = styled.div`
  padding-top: 15px;
`

const propsByTaxQuery = gql`
  query propsByTaxDataQueryForPropertiesRCOs(
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

const RCOs = () => {
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

  const rcNames = Object.keys(rcoPropertiesByPropertyCollection)

  if (error) return `Error fetching data: ${error.message}`

  if (loading) {
    return (
      <SpinnerContainer>
        <Spinner message="" />
      </SpinnerContainer>
    )
  }

  return rcNames.map((pcName) => <RCO key={pcName} pc={pcName} />)
}

export default observer(RCOs)
