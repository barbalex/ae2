// @flow
import React from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import compose from 'recompose/compose'
import styled from 'styled-components'
import get from 'lodash/get'

import TaxonomyObject from './TaxonomyObject'
import PropertyCollectionObject from './PropertyCollectionObject'

const Container = styled.div`
  padding: 5px;
  height: calc(100% - 48px);
  overflow: auto !important;
`
const Title = styled.h3`
  margin: 15px 0 -5px 0;
`
const FirstTitle = styled(Title)`
  margin: 5px 0 -5px 0;
`

const enhance = compose(inject('store'), observer)

const Objekt = ({ store }: { store: Object }) => {
  const { activeTaxonomyObject } = store
  console.log('activeTaxonomyObject:', toJS(store.activeTaxonomyObject))
  const taxCount = get(
    activeTaxonomyObject,
    'taxonomyObjectsByObjectId.totalCount',
    0
  )
  const taxonomyObjects = get(
    activeTaxonomyObject,
    'taxonomyObjectsByObjectId.nodes',
    []
  )
  const pcCount = get(
    activeTaxonomyObject,
    'propertyCollectionObjectsByObjectId.totalCount',
    0
  )
  const propertyCollectionObjects = get(
    activeTaxonomyObject,
    'propertyCollectionObjectsByObjectId.nodes',
    []
  )
  const rcCount = get(
    activeTaxonomyObject,
    'relationCollectionObjectsByObjectId.totalCount',
    0
  )

  return (
    <Container>
      <FirstTitle>{`Taxonomien (${taxCount})`}</FirstTitle>
      {taxonomyObjects.map(taxonomyObject =>
        <TaxonomyObject
          key={taxonomyObject.id}
          taxonomyObject={taxonomyObject}
        />
      )}
      <Title>{`Eigenschaften-Sammlungen (${pcCount})`}</Title>
      {propertyCollectionObjects.map((pCO, index) =>
        <PropertyCollectionObject
          key={`${pCO.propertyCollectionId}`}
          pCO={pCO}
        />
      )}
      <Title>{`Beziehungs-Sammlungen (${rcCount})`}</Title>
    </Container>
  )
}

export default enhance(Objekt)
