// @flow
import React from 'react'
import { Card, CardHeader, CardText } from 'material-ui/Card'
import styled from 'styled-components'
import { withApollo } from 'react-apollo'
import get from 'lodash/get'
import groupBy from 'lodash/groupBy'
import compose from 'recompose/compose'

import RcoField from '../../RcoField'
import constants from '../../../../../../modules/constants'
import propsByTaxData from '../../../propsByTaxData'
import exportTaxonomiesData from '../../../../exportTaxonomiesData'
import ErrorBoundary from '../../../../../shared/ErrorBoundary'

const Level3Card = styled(Card)`
  margin: 0;
  padding: 0;
`
const Level3CardHeader = styled(CardHeader)`
  background-color: #fff3e0;
  border-bottom: 1px solid #ebebeb;
`
const Level3CardText = styled(CardText)`
  padding: 0 !important;
`
const Level3Count = styled.span`
  font-size: x-small;
  padding-left: 5px;
`
const PropertiesContainer = styled.div`
  margin: 8px 0;
  padding-bottom: 10px;
  column-width: ${props =>
    props['data-width'] > 2 * constants.export.properties.columnWidth
      ? `${constants.export.properties.columnWidth}px`
      : 'auto'};
`

const level2CardTitleStyle = { fontWeight: 'bold' }

const enhance = compose(withApollo, exportTaxonomiesData, propsByTaxData)

const RcoCard = ({
  propsByTaxData,
  rcoExpanded,
  onToggleRco,
  pc,
}: {
  propsByTaxData: Object,
  rcoExpanded: Boolean,
  onToggleRco: () => {},
  pc: Object,
}) => {
  const rcoProperties = get(
    propsByTaxData,
    'rcoPropertiesByTaxonomiesFunction.nodes',
    []
  )

  const rcoPropertiesByPropertyCollection = groupBy(rcoProperties, x => {
    if (x.propertyCollectionName.includes(x.relationType)) {
      return x.propertyCollectionName
    }
    return `${x.propertyCollectionName}: ${x.relationType}`
  })

  return (
    <ErrorBoundary>
      <Level3Card key={pc}>
        <Level3CardHeader
          title={
            <div>
              {pc}
              <Level3Count>{`(${rcoPropertiesByPropertyCollection[pc].length} ${
                rcoPropertiesByPropertyCollection[pc].length === 1
                  ? 'Feld'
                  : 'Felder'
              })`}</Level3Count>
            </div>
          }
          actAsExpander={true}
          showExpandableButton={true}
          titleStyle={level2CardTitleStyle}
        />
        <Level3CardText expandable={true}>
          <PropertiesContainer data-width={window.innerWidth - 84}>
            {rcoPropertiesByPropertyCollection[pc].map(field => (
              <RcoField
                key={`${field.propertyName}${field.jsontype}`}
                pcname={field.propertyCollectionName}
                pname={field.propertyName}
                jsontype={field.jsontype}
              />
            ))}
          </PropertiesContainer>
        </Level3CardText>
      </Level3Card>
    </ErrorBoundary>
  )
}

export default enhance(RcoCard)