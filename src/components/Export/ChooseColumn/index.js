import React, { useCallback, useState, useContext } from 'react'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Icon from '@mui/material/Icon'
import { MdExpandMore as ExpandMoreIcon } from 'react-icons/md'
import Snackbar from '@mui/material/Snackbar'
import styled from '@emotion/styled'
import { observer } from 'mobx-react-lite'
import SimpleBar from 'simplebar-react'

import Taxonomies from './Taxonomies'
import Properties from './Properties'
import Filter from './Filter'
import storeContext from '../../../storeContext'
import ErrorBoundary from '../../shared/ErrorBoundary'

const StyledSnackbar = styled(Snackbar)`
  div {
    min-width: auto;
    background-color: #2e7d32 !important;
  }
`
const StyledCard = styled(Card)`
  margin: 10px 0;
  background-color: rgb(255, 243, 224) !important;
`
const StyledCardActions = styled(CardActions)`
  justify-content: space-between;
  cursor: pointer;
  height: auto !important;
  background-color: #ffcc80;
`
const CardActionIconButton = styled(IconButton)`
  transform: ${(props) => (props['data-expanded'] ? 'rotate(180deg)' : 'none')};
`
const CardActionTitle = styled.div`
  padding-left: 8px;
  font-weight: bold;
  word-break: break-word;
`
const Container = styled.div`
  padding: 0 5px;
  overflow-x: hidden !important;
  height: 100%;
  user-select: none !important;
`

const Export = () => {
  const store = useContext(storeContext)
  const exportTaxonomies = store.export.taxonomies.toJSON()

  const [taxonomiesExpanded, setTaxonomiesExpanded] = useState(true)
  const [filterExpanded, setFilterExpanded] = useState(false)
  const [propertiesExpanded, setPropertiesExpanded] = useState(false)
  const [message, setMessage] = useState('')

  const onSetMessage = useCallback((message) => {
    setMessage(message)
    if (message) {
      setTimeout(() => setMessage(''), 5000)
    }
  }, [])
  const onToggleTaxonomies = useCallback(() => {
    setTaxonomiesExpanded(!taxonomiesExpanded)
    // close all others
    setFilterExpanded(false)
    setPropertiesExpanded(false)
  }, [taxonomiesExpanded])
  const onToggleFilter = useCallback(() => {
    if (!filterExpanded && exportTaxonomies.length > 0) {
      setFilterExpanded(true)
      // close all others
      setTaxonomiesExpanded(false)
      setPropertiesExpanded(false)
    } else {
      setFilterExpanded(false)
      onSetMessage('Bitte wählen Sie mindestens eine Taxonomie')
    }
  }, [filterExpanded, exportTaxonomies.length, onSetMessage])
  const onToggleProperties = useCallback(() => {
    if (!propertiesExpanded && exportTaxonomies.length > 0) {
      setPropertiesExpanded(true)
      // close all others
      setTaxonomiesExpanded(false)
      setFilterExpanded(false)
    } else {
      setPropertiesExpanded(false)
      onSetMessage('Bitte wählen Sie mindestens eine Gruppe')
    }
  }, [propertiesExpanded, exportTaxonomies.length, onSetMessage])

  return (
    <ErrorBoundary>
      <SimpleBar style={{ maxHeight: '100%', height: '100%' }}>
        <Container>
          <StyledCard>
            <StyledCardActions disableSpacing onClick={onToggleTaxonomies}>
              <CardActionTitle>1. Taxonomie(n) wählen</CardActionTitle>
              <CardActionIconButton
                data-expanded={taxonomiesExpanded}
                aria-expanded={taxonomiesExpanded}
                aria-label="Show more"
              >
                <Icon>
                  <ExpandMoreIcon />
                </Icon>
              </CardActionIconButton>
            </StyledCardActions>
            <Collapse in={taxonomiesExpanded} timeout="auto" unmountOnExit>
              {taxonomiesExpanded && <Taxonomies />}
            </Collapse>
          </StyledCard>
          <StyledCard>
            <StyledCardActions disableSpacing onClick={onToggleFilter}>
              <CardActionTitle>2. filtern</CardActionTitle>
              <CardActionIconButton
                data-expanded={filterExpanded}
                aria-expanded={filterExpanded}
                aria-label="Show more"
              >
                <Icon>
                  <ExpandMoreIcon />
                </Icon>
              </CardActionIconButton>
            </StyledCardActions>
            <Collapse in={filterExpanded} timeout="auto" unmountOnExit>
              <Filter />
            </Collapse>
          </StyledCard>
          <StyledCard>
            <StyledCardActions disableSpacing onClick={onToggleProperties}>
              <CardActionTitle>3. Eigenschaften wählen</CardActionTitle>
              <CardActionIconButton
                data-expanded={propertiesExpanded}
                aria-expanded={propertiesExpanded}
                aria-label="Show more"
              >
                <Icon>
                  <ExpandMoreIcon />
                </Icon>
              </CardActionIconButton>
            </StyledCardActions>
            <Collapse in={propertiesExpanded} timeout="auto" unmountOnExit>
              <Properties />
            </Collapse>
          </StyledCard>
          <StyledSnackbar open={!!message} message={message} />
        </Container>
      </SimpleBar>
    </ErrorBoundary>
  )
}

export default observer(Export)
