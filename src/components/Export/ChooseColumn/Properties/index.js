import React, { useState, useCallback, useContext } from 'react'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'
import { observer } from 'mobx-react-lite'

import HowTo from './HowTo'
import Taxonomies from './Taxonomies'
import PCOs from './PCOs'
import RCOs from './RCOs'
import storeContext from '../../../../storeContext'
import ErrorBoundary from '../../../shared/ErrorBoundary'

const Container = styled.div`
  padding: 0 5px;
`

const propsByTaxQuery = gql`
  query propsByTaxDataQuery(
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

const Properties = () => {
  const mobxStore = useContext(storeContext)
  const exportTaxonomies = mobxStore.export.taxonomies.toJSON()

  const { data: propsByTaxData, error: propsByTaxError } = useQuery(
    propsByTaxQuery,
    {
      variables: {
        exportTaxonomies,
        queryExportTaxonomies: exportTaxonomies.length > 0,
      },
    },
  )

  const [taxonomiesExpanded, setTaxonomiesExpanded] = useState(false)
  const [pcoExpanded, setFilterExpanded] = useState(false)
  const [rcoExpanded, setPropertiesExpanded] = useState(false)

  const onToggleTaxonomies = useCallback(() => {
    setTaxonomiesExpanded(!taxonomiesExpanded)
    // TODO (later)
    // check if only one Taxonomy
    // if so: open it

    // close all others
    setFilterExpanded(false)
    setPropertiesExpanded(false)
  }, [taxonomiesExpanded])
  const onTogglePco = useCallback(() => {
    if (!pcoExpanded) {
      setFilterExpanded(true)
      // close all others
      setTaxonomiesExpanded(false)
      setPropertiesExpanded(false)
    } else {
      setFilterExpanded(false)
    }
  }, [pcoExpanded])
  const onToggleRco = useCallback(() => {
    if (!rcoExpanded) {
      setPropertiesExpanded(true)
      // close all others
      setTaxonomiesExpanded(false)
      setFilterExpanded(false)
    } else {
      setPropertiesExpanded(false)
    }
  }, [rcoExpanded])

  const pcoProperties =
    propsByTaxData?.pcoPropertiesByTaxonomiesFunction?.nodes ?? []
  const rcoProperties =
    propsByTaxData?.rcoPropertiesByTaxonomiesFunction?.nodes ?? []

  if (propsByTaxError) return `Error fetching data: ${propsByTaxError.message}`

  return (
    <ErrorBoundary>
      <Container>
        <HowTo />
        <Taxonomies
          taxonomiesExpanded={taxonomiesExpanded}
          onToggleTaxonomies={onToggleTaxonomies}
        />
        {pcoProperties.length > 0 && (
          <PCOs pcoExpanded={pcoExpanded} onTogglePco={onTogglePco} />
        )}
        {rcoProperties.length > 0 && (
          <RCOs rcoExpanded={rcoExpanded} onToggleRco={onToggleRco} />
        )}
      </Container>
    </ErrorBoundary>
  )
}

export default observer(Properties)
