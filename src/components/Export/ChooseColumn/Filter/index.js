import React, { useState, useCallback, useContext } from 'react'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import styled from '@emotion/styled'
import { observer } from 'mobx-react-lite'

import HowTo from './HowTo'
import Tipps from './Tipps'
import Id from './Id'
import Taxonomies from './Taxonomies'
import PCOs from './PCOs'
import RCOs from './RCOs'
import storeContext from '../../../../storeContext'
import ErrorBoundary from '../../../shared/ErrorBoundary'

const Container = styled.div`
  padding: 0 5px;
`
const Label = styled(FormControlLabel)`
  height: 30px;
  min-height: 30px;
  > span {
    font-weight: 500;
    line-height: 1em;
  }
`

const Filter = () => {
  const store = useContext(storeContext)
  const {
    setWithSynonymData,
    withSynonymData,
    addFilterFields,
    setAddFilterFields,
  } = store.export

  const [taxonomiesExpanded, setTaxonomiesExpanded] = useState(false)
  const [pcoExpanded, setFilterExpanded] = useState(false)
  const [rcoExpanded, setPropertiesExpanded] = useState(false)

  const onToggleTaxonomies = useCallback(() => {
    setTaxonomiesExpanded(!taxonomiesExpanded)
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
        <Tipps />
        <FormGroup>
          <Label
            control={
              <Checkbox
                color="primary"
                checked={withSynonymData}
                onChange={(event, checked) => setWithSynonymData(checked)}
              />
            }
            label="Informationen von Synonymen mit exportieren"
          />
          <Label
            control={
              <Checkbox
                color="primary"
                checked={addFilterFields}
                onChange={(event, checked) => setAddFilterFields(checked)}
              />
            }
            label="Gefilterte Felder immer exportieren"
          />
        </FormGroup>
        <Id />
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

export default observer(Filter)
