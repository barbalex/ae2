// @flow
import React, { useState, useCallback } from 'react'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Collapse from '@material-ui/core/Collapse'
import IconButton from '@material-ui/core/IconButton'
import Icon from '@material-ui/core/Icon'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import styled from 'styled-components'
import get from 'lodash/get'
import groupBy from 'lodash/groupBy'
import compose from 'recompose/compose'

import AllChooser from './AllChooser'
import Chooser from './Chooser'
import constants from '../../../../../../modules/constants'
import withPropsByTaxData from '../../../withPropsByTaxData'
import withExportTaxonomiesData from '../../../../withExportTaxonomiesData'
import withData from '../../withData'
import ErrorBoundary from '../../../../../shared/ErrorBoundary'

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
  transform: ${props => (props['data-expanded'] ? 'rotate(180deg)' : 'none')};
`
const CardActionTitle = styled.div`
  padding-left: 8px;
  font-weight: bold;
  word-break: break-word;
`
const StyledCardContent = styled(CardContent)`
  display: flex;
  flex-direction: column;
`
const PropertiesContainer = styled.div`
  column-width: ${props =>
    props['withData-width'] > 2 * constants.export.properties.columnWidth
      ? `${constants.export.properties.columnWidth}px`
      : 'auto'};
`
const Count = styled.span`
  font-size: x-small;
  padding-left: 5px;
`

const enhance = compose(
  withExportTaxonomiesData,
  withData,
  withPropsByTaxData,
)

const Properties = ({
  initiallyExpanded,
  propsByTaxData,
  data,
  tax,
}: {
  initiallyExpanded: Boolean,
  propsByTaxData: Object,
  data: Object,
  tax: String,
}) => {
  const [expanded, setExpanded] = useState()
  const onClickActions = useCallback(() => setExpanded(!expanded), [expanded])

  const taxProperties = get(
    propsByTaxData,
    'taxPropertiesByTaxonomiesFunction.nodes',
    [],
  )
  const taxPropertiesByTaxonomy = groupBy(taxProperties, 'taxonomyName')

  return (
    <ErrorBoundary>
      <StyledCard>
        <StyledCardActions disableActionSpacing onClick={onClickActions}>
          <CardActionTitle>
            {tax}
            <Count>{`(${taxPropertiesByTaxonomy[tax].length} ${
              taxPropertiesByTaxonomy[tax].length === 1 ? 'Feld' : 'Felder'
            })`}</Count>
            <CardActionIconButton
              data-expanded={expanded}
              aria-expanded={expanded}
              aria-label="Show more"
            >
              <Icon>
                <ExpandMoreIcon />
              </Icon>
            </CardActionIconButton>
          </CardActionTitle>
        </StyledCardActions>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <StyledCardContent>
            <>
              {taxPropertiesByTaxonomy[tax].length > 1 && (
                <AllChooser properties={taxPropertiesByTaxonomy[tax]} />
              )}
              <PropertiesContainer data-width={window.innerWidth - 84}>
                {taxPropertiesByTaxonomy[tax].map(field => (
                  <Chooser
                    key={`${field.propertyName}${field.jsontype}`}
                    taxname={field.taxonomyName}
                    pname={field.propertyName}
                    jsontype={field.jsontype}
                    count={field.count}
                  />
                ))}
              </PropertiesContainer>
            </>
          </StyledCardContent>
        </Collapse>
      </StyledCard>
    </ErrorBoundary>
  )
}

export default enhance(Properties)
