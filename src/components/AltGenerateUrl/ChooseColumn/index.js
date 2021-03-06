import React, { useEffect, useState, useCallback, useContext } from 'react'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'
import { observer } from 'mobx-react-lite'
import SimpleBar from 'simplebar-react'
import { withResizeDetector } from 'react-resize-detector'

import ErrorBoundary from '../../shared/ErrorBoundary'
import HowTo from './HowTo'
import Taxonomies from './Taxonomies'
import PCOs from './PCOs'
import RCOs from './RCOs'
import Snackbar from '@material-ui/core/Snackbar'
import getConstants from '../../../modules/constants'
import mobxStoreContext from '../../../mobxStoreContext'

const Container = styled.div`
  padding: 10px;
  height: 100%;
`
const StyledSnackbar = styled(Snackbar)`
  div {
    min-width: auto;
    background-color: #2e7d32 !important;
  }
`
const StyledH3 = styled.h3`
  padding-left: 10px;
`

const propsByTaxQuery = gql`
  query propsByTaxDataQuery($exportTaxonomies: [String]) {
    pcoPropertiesByTaxonomiesFunction(taxonomyNames: $exportTaxonomies) {
      nodes {
        propertyCollectionName
        propertyName
        jsontype
        count
      }
    }
    rcoPropertiesByTaxonomiesFunction(taxonomyNames: $exportTaxonomies) {
      nodes {
        propertyCollectionName
        relationType
        propertyName
        jsontype
        count
      }
    }
    taxPropertiesByTaxonomiesFunction(taxonomyNames: $exportTaxonomies) {
      nodes {
        taxonomyName
        propertyName
        jsontype
        count
      }
    }
  }
`

const Properties = ({ height }) => {
  const mobxStore = useContext(mobxStoreContext)
  const { setTaxonomies } = mobxStore.export
  const constants = getConstants()

  const { loading } = useQuery(propsByTaxQuery, {
    variables: {
      exportTaxonomies: constants.altTaxonomies,
    },
  })

  useEffect(() => {
    setTaxonomies(constants.altTaxonomies)
  }, [constants.altTaxonomies, setTaxonomies])

  const [taxonomiesExpanded, setTaxonomiesExpanded] = useState(false)
  const [pcoExpanded, setPcoExpanded] = useState(false)
  const [rcoExpanded, setPropertiesExpanded] = useState(false)
  const message = loading ? 'Lade Daten. Das dauert eine Weile' : ''

  const onToggleTaxonomies = useCallback(() => {
    setTaxonomiesExpanded(!taxonomiesExpanded)
    // TODO (later)
    // check if only one Taxonomy
    // if so: open it

    // close all others
    setPcoExpanded(false)
    setPropertiesExpanded(false)
  }, [taxonomiesExpanded])
  const onTogglePco = useCallback(() => {
    if (!pcoExpanded) {
      setPcoExpanded(true)
      // close all others
      setTaxonomiesExpanded(false)
      setPropertiesExpanded(false)
    } else {
      setPcoExpanded(false)
    }
  }, [pcoExpanded])
  const onToggleRco = useCallback(() => {
    if (!rcoExpanded) {
      setPropertiesExpanded(true)
      // close all others
      setTaxonomiesExpanded(false)
      setPcoExpanded(false)
    } else {
      setPropertiesExpanded(false)
    }
  }, [rcoExpanded])

  return (
    <ErrorBoundary>
      <SimpleBar style={{ maxHeight: height, height: '100%' }}>
        <Container>
          <StyledH3>Eigenschaften wählen</StyledH3>
          <HowTo />
          <Taxonomies
            taxonomiesExpanded={taxonomiesExpanded}
            onToggleTaxonomies={onToggleTaxonomies}
          />
          <PCOs pcoExpanded={pcoExpanded} onTogglePco={onTogglePco} />
          <RCOs rcoExpanded={rcoExpanded} onToggleRco={onToggleRco} />
          <StyledSnackbar open={!!message} message={message} />
        </Container>
      </SimpleBar>
    </ErrorBoundary>
  )
}

export default withResizeDetector(observer(Properties))
