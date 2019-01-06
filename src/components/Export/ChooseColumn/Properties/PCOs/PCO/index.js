// @flow
import React, { useState, useCallback } from 'react'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import Collapse from '@material-ui/core/Collapse'
import IconButton from '@material-ui/core/IconButton'
import Icon from '@material-ui/core/Icon'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import styled from 'styled-components'
import get from 'lodash/get'
import groupBy from 'lodash/groupBy'
import { useQuery } from 'react-apollo-hooks'
import gql from 'graphql-tag'

import AllChooser from './AllChooser'
import Properties from './Properties'
import constants from '../../../../../../modules/constants'
import propsByTaxQuery from './propsByTaxQuery'
import ErrorBoundary from '../../../../../shared/ErrorBoundary'

const StyledCard = styled(Card)`
  margin: 0;
  background-color: rgb(255, 243, 224) !important;
`
const StyledCardActions = styled(CardActions)`
  justify-content: space-between;
  cursor: pointer;
  height: auto !important;
  background-color: #fff3e0;
  border-bottom: 1px solid #ebebeb;
`
const CardActionIconButton = styled(IconButton)`
  transform: ${props => (props['data-expanded'] ? 'rotate(180deg)' : 'none')};
`
const CardActionTitle = styled.div`
  padding-left: 8px;
  font-weight: bold;
  word-break: break-word;
`
const PropertiesContainer = styled.div`
  column-width: ${props =>
    props['data-width'] > 2 * constants.export.properties.columnWidth
      ? `${constants.export.properties.columnWidth}px`
      : 'auto'};
`
const StyledCollapse = styled(Collapse)`
  padding: 8px 20px;
`
const Count = styled.span`
  font-size: x-small;
  padding-left: 5px;
`

const storeQuery = gql`
  query exportTaxonomiesQuery {
    exportTaxonomies @client
  }
`

const PCO = ({
  pcoExpanded,
  onTogglePco,
  pc,
}: {
  pcoExpanded: Boolean,
  onTogglePco: () => {},
  pc: Object,
}) => {
  const { data: storeData } = useQuery(storeQuery, { suspend: false })
  const exportTaxonomies = get(storeData, 'exportTaxonomies', [])
  const { data: propsData, error: propsDataError } = useQuery(propsByTaxQuery, {
    suspend: false,
    variables: {
      exportTaxonomies,
      queryExportTaxonomies: exportTaxonomies.length > 0,
    },
  })

  const [expanded, setExpanded] = useState(false)
  const onClickActions = useCallback(() => setExpanded(!expanded), [expanded])

  const pcoProperties = get(
    propsData,
    'pcoPropertiesByTaxonomiesFunction.nodes',
    [],
  )
  const pcoPropertiesByPropertyCollection = groupBy(
    pcoProperties,
    'propertyCollectionName',
  )
  const properties = pcoPropertiesByPropertyCollection[pc]

  if (propsDataError) return `Error fetching data: ${propsDataError.message}`

  return (
    <ErrorBoundary>
      <StyledCard>
        <StyledCardActions disableActionSpacing onClick={onClickActions}>
          <CardActionTitle>
            {pc}
            <Count>{`(${properties.length} ${
              properties.length === 1 ? 'Feld' : 'Felder'
            })`}</Count>
          </CardActionTitle>
          <CardActionIconButton
            data-expanded={expanded}
            aria-expanded={expanded}
            aria-label="Show more"
          >
            <Icon>
              <ExpandMoreIcon />
            </Icon>
          </CardActionIconButton>
        </StyledCardActions>
        <StyledCollapse in={expanded} timeout="auto" unmountOnExit>
          <>
            {properties.length > 1 && <AllChooser properties={properties} />}
            <PropertiesContainer data-width={window.innerWidth - 84}>
              <Properties properties={properties} />
            </PropertiesContainer>
          </>
        </StyledCollapse>
      </StyledCard>
    </ErrorBoundary>
  )
}

export default PCO
