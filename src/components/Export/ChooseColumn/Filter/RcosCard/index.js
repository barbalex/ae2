// @flow
import React from 'react'
import { Card, CardHeader, CardText } from 'material-ui/Card'
import styled from 'styled-components'
import { withApollo } from 'react-apollo'
import get from 'lodash/get'
import groupBy from 'lodash/groupBy'
import compose from 'recompose/compose'

import RcoCard from './RcoCard'
import propsByTaxData from '../../propsByTaxData'
import exportTaxonomiesData from '../../../exportTaxonomiesData'
import ErrorBoundary from '../../../../shared/ErrorBoundary'

const Level2Card = styled(Card)`
  margin: 10px 0;
  padding: 0;
  > div {
    padding-bottom: 0 !important;
  }
`
const Level2CardHeader = styled(CardHeader)`
  background-color: #ffcc80;
`
const Level2CardText = styled(CardText)`
  padding: 0 !important;
`
const Level2Count = styled.span`
  font-size: x-small;
  padding-left: 5px;
`

const level2CardTitleStyle = { fontWeight: 'bold' }

const enhance = compose(withApollo, exportTaxonomiesData, propsByTaxData)

const RcosCard = ({
  propsByTaxData,
  rcoExpanded,
  onToggleRco,
}: {
  propsByTaxData: Object,
  rcoExpanded: Boolean,
  onToggleRco: () => {},
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
  const rcoPropertiesFields = groupBy(rcoProperties, 'propertyName')
  //console.log('RcosCard: pcoPropertiesFields:', pcoPropertiesFields)
  const rCCount = Object.keys(rcoPropertiesByPropertyCollection).length

  return (
    <ErrorBoundary>
      <Level2Card expanded={rcoExpanded} onExpandChange={onToggleRco}>
        <Level2CardHeader
          title={
            <div>
              Beziehungssammlungen{rCCount > 0 && (
                <Level2Count>{`(${rCCount} Sammlungen, ${
                  Object.keys(rcoPropertiesFields).length
                } ${
                  Object.keys(rcoPropertiesFields).length === 1
                    ? 'Feld'
                    : 'Felder'
                })`}</Level2Count>
              )}
            </div>
          }
          actAsExpander={true}
          showExpandableButton={true}
          titleStyle={level2CardTitleStyle}
        />
        <Level2CardText expandable={true}>
          {Object.keys(rcoPropertiesByPropertyCollection).map(pc => (
            <RcoCard key={pc} pc={pc} />
          ))}
        </Level2CardText>
      </Level2Card>
    </ErrorBoundary>
  )
}

export default enhance(RcosCard)
