import React, { useState, useCallback, useContext } from 'react'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import Collapse from '@material-ui/core/Collapse'
import IconButton from '@material-ui/core/IconButton'
import Icon from '@material-ui/core/Icon'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import styled from 'styled-components'
import get from 'lodash/get'
import groupBy from 'lodash/groupBy'
import { useQuery, gql } from '@apollo/client'
import { observer } from 'mobx-react-lite'
import { withResizeDetector } from 'react-resize-detector'

import Properties from './Properties'
import mobxStoreContext from '../../../../../../mobxStoreContext'
import ErrorBoundary from '../../../../../shared/ErrorBoundary'
import getConstants from '../../../../../../modules/constants'
const constants = getConstants()

const ErrorContainer = styled.div`
  padding: 5px;
`
const StyledCard = styled(Card)`
  margin: 0;
  background-color: rgb(255, 243, 224) !important;
`
const StyledCardActions = styled(CardActions)`
  justify-content: space-between;
  cursor: pointer;
  background-color: #fff3e0;
  border-bottom: 1px solid #ebebeb;
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  height: auto !important;
`
const CardActionIconButton = styled(IconButton)`
  transform: ${(props) => (props['data-expanded'] ? 'rotate(180deg)' : 'none')};
`
const CardActionTitle = styled.div`
  padding-left: 8px;
  font-weight: bold;
  word-break: break-word;
`
const Count = styled.span`
  font-size: x-small;
  padding-left: 5px;
`
const PropertiesContainer = styled.div`
  margin: 8px 0;
  padding-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
`

const propsByTaxQuery = gql`
  query propsByTaxDataQuery(
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

const RcoCard = ({ pc, width = 500 }) => {
  const mobxStore = useContext(mobxStoreContext)
  const exportTaxonomies = mobxStore.export.taxonomies.toJSON()

  const { data: propsByTaxData, error: propsByTaxDataError } = useQuery(
    propsByTaxQuery,
    {
      variables: {
        exportTaxonomies,
        queryExportTaxonomies: exportTaxonomies.length > 0,
      },
    },
  )

  const [expanded, setExpanded] = useState(false)
  const onClickActions = useCallback(() => setExpanded(!expanded), [expanded])

  const rcoProperties = get(
    propsByTaxData,
    'rcoPropertiesByTaxonomiesFunction.nodes',
    [],
  )

  const rcoPropertiesByPropertyCollection = groupBy(rcoProperties, (x) => {
    if (x.propertyCollectionName.includes(x.relationType)) {
      return x.propertyCollectionName
    }
    return `${x.propertyCollectionName}: ${x.relationType}`
  })

  const columns = Math.floor(width / constants.export.properties.columnWidth)

  if (propsByTaxDataError) {
    return (
      <ErrorContainer>
        `Error loading data: ${propsByTaxDataError.message}`
      </ErrorContainer>
    )
  }

  return (
    <ErrorBoundary>
      <StyledCard>
        <StyledCardActions disableSpacing onClick={onClickActions}>
          <CardActionTitle>
            {pc}
            <Count>{`(${rcoPropertiesByPropertyCollection[pc].length} ${
              rcoPropertiesByPropertyCollection[pc].length === 1
                ? 'Feld'
                : 'Felder'
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
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <PropertiesContainer>
            <Properties
              properties={rcoPropertiesByPropertyCollection[pc]}
              columns={columns}
            />
          </PropertiesContainer>
        </Collapse>
      </StyledCard>
    </ErrorBoundary>
  )
}

export default withResizeDetector(observer(RcoCard))
