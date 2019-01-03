// @flow
import React, { lazy, Suspense } from 'react'
import compose from 'recompose/compose'
import get from 'lodash/get'

import withActiveNodeArrayData from '../modules/withActiveNodeArrayData'
import LazyImportFallback from './shared/LazyImportFallback'

const Pco = lazy(() => import('./PropertyCollection/PCO'))
const Rco = lazy(() => import('./PropertyCollection/RCO'))
const Objekt = lazy(() => import('./Objekt'))
const Taxonomy = lazy(() => import('./Taxonomy'))
const PropertyCollection = lazy(() => import('./PropertyCollection'))
const Benutzer = lazy(() => import('./Benutzer'))
const Organisation = lazy(() => import('./Organisation'))

const enhance = compose(withActiveNodeArrayData)

const DataType = ({
  activeNodeArrayData,
  dimensions,
  stacked = false,
}: {
  activeNodeArrayData: Object,
  dimensions: Object,
  stacked: Boolean,
}) => {
  const activeNodeArray = get(activeNodeArrayData, 'activeNodeArray', [])
  const showObjekt =
    ['Arten', 'Lebensräume'].includes(activeNodeArray[0]) &&
    activeNodeArray.length > 1
  const showTaxonomy =
    ['Arten', 'Lebensräume'].includes(activeNodeArray[0]) &&
    activeNodeArray.length === 2
  const showPC =
    activeNodeArray[0] === 'Eigenschaften-Sammlungen' &&
    activeNodeArray[1] &&
    activeNodeArray.length === 2
  const showPCO =
    activeNodeArray[0] === 'Eigenschaften-Sammlungen' &&
    activeNodeArray[1] &&
    activeNodeArray.length === 3 &&
    activeNodeArray[2] === 'Eigenschaften'
  const showRCO =
    activeNodeArray[0] === 'Eigenschaften-Sammlungen' &&
    activeNodeArray[1] &&
    activeNodeArray.length === 3 &&
    activeNodeArray[2] === 'Beziehungen'
  const showBenutzer =
    activeNodeArray[0] === 'Benutzer' && activeNodeArray.length === 2
  const showOrganization =
    activeNodeArray[0] === 'Organisationen' && activeNodeArray.length === 2

  if (showTaxonomy)
    return (
      <Suspense fallback={<LazyImportFallback />}>
        <Taxonomy />
      </Suspense>
    )
  if (showObjekt)
    return (
      <Suspense fallback={<LazyImportFallback />}>
        <Objekt stacked={stacked} />
      </Suspense>
    )
  if (showPC)
    return (
      <Suspense fallback={<LazyImportFallback />}>
        <PropertyCollection />
      </Suspense>
    )
  if (showPCO)
    return (
      <Suspense fallback={<LazyImportFallback />}>
        <Pco dimensions={dimensions} />
      </Suspense>
    )
  if (showRCO)
    return (
      <Suspense fallback={<LazyImportFallback />}>
        <Rco dimensions={dimensions} />
      </Suspense>
    )
  if (showBenutzer)
    return (
      <Suspense fallback={<LazyImportFallback />}>
        <Benutzer />
      </Suspense>
    )
  if (showOrganization)
    return (
      <Suspense fallback={<LazyImportFallback />}>
        <Organisation />
      </Suspense>
    )
  return null
}

export default enhance(DataType)
