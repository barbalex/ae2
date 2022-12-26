import React, { useContext } from 'react'
import styled from '@emotion/styled'
import { observer } from 'mobx-react-lite'
import { Routes, Route } from 'react-router-dom'
import { getSnapshot } from 'mobx-state-tree'

import ErrorBoundary from './shared/ErrorBoundary'
import storeContext from '../storeContext'
import DataStacked from './Data/DataStacked'
import DataFlexed from './Data/DataFlexed'
import Home from './Home'
import Benutzer from './Benutzer'
import Organisation from './Organisation'
import Objekt from './Objekt'
import PCO from './PropertyCollection/PCO'
import RCO from './PropertyCollection/RCO'
import Taxonomy from './Taxonomy'
import PropertyCollection from './PropertyCollection'
import Dokumentation from '../pages/Dokumentation'
import ExportStacked from './Export/ExportStacked'
import ExportFlexed from './Export/ExportFlexed'

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`

// TODO:
// Use react-router with outlets
// render routes in outlet inside Data
const App = () => {
  const store = useContext(storeContext)
  const { stacked } = store
  const activeNodeArray = getSnapshot(store.activeNodeArray)

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

  return (
    <ErrorBoundary>
      <Container>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="Daten/*"
            element={stacked ? <DataStacked /> : <DataFlexed />}
          >
            <Route
              path="Daten/Arten/*"
              element={
                showTaxonomy ? <Taxonomy /> : showObjekt ? <Objekt /> : null
              }
            />
            <Route
              path="Daten/Lebensräume/*"
              element={
                showTaxonomy ? <Taxonomy /> : showObjekt ? <Objekt /> : null
              }
            />
            <Route
              path="Daten/Eigenschaften-Sammlungen/*"
              element={
                showPC ? (
                  <PropertyCollection />
                ) : showPCO ? (
                  <PCO />
                ) : showRCO ? (
                  <RCO />
                ) : null
              }
            />
            <Route path="Daten/Benutzer/*" element={<Benutzer />} />
            <Route path="Daten/Organisationen/*" element={<Organisation />} />
          </Route>
          <Route path="/Dokumentation/*" element={<Dokumentation />} />
          <Route
            path="/Export/*"
            element={stacked ? <ExportStacked /> : <ExportFlexed />}
          />
        </Routes>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(App)
