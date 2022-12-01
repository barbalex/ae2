import React, { useState, useCallback } from 'react'
import styled from '@emotion/styled'
import { observer } from 'mobx-react-lite'

import HowTo from './HowTo'
import Taxonomies from './Taxonomies'
import PCOs from './PCOs'
import RCOs from './RCOs'
import ErrorBoundary from '../../../shared/ErrorBoundary'

const Container = styled.div`
  padding: 0 5px;
`

const Properties = () => {
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

  return (
    <ErrorBoundary>
      <Container>
        <HowTo />
        <Taxonomies
          taxonomiesExpanded={taxonomiesExpanded}
          onToggleTaxonomies={onToggleTaxonomies}
        />
        <PCOs pcoExpanded={pcoExpanded} onTogglePco={onTogglePco} />
        <RCOs rcoExpanded={rcoExpanded} onToggleRco={onToggleRco} />
      </Container>
    </ErrorBoundary>
  )
}

export default observer(Properties)
