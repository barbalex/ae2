import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { getSnapshot } from 'mobx-state-tree'

//import LazyImportFallback from './shared/LazyImportFallback'
import storeContext from '../storeContext'
import Pco from './PropertyCollection/PCO'
import Rco from './PropertyCollection/RCO'
import Objekt from './Objekt'
import Taxonomy from './Taxonomy'
import PropertyCollection from './PropertyCollection'
import Benutzer from './Benutzer'
import Organisation from './Organisation'
import Home from './Home'

const DataType = ({ stacked = false }) => {
  const store = useContext(storeContext)
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
  const showBenutzer =
    activeNodeArray[0] === 'Benutzer' && activeNodeArray.length === 2
  const showOrganization =
    activeNodeArray[0] === 'Organisationen' && activeNodeArray.length === 2

  if (showTaxonomy) return <Taxonomy />
  if (showObjekt) return <Objekt stacked={stacked} />
  if (showPC) return <PropertyCollection />
  if (showPCO) return <Pco />
  if (showRCO) return <Rco />
  if (showBenutzer) return <Benutzer />
  if (showOrganization) return <Organisation />
  return <Home />
}

export default observer(DataType)
