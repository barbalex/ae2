import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'

import Header from '../components/Head'
import storeContext from '../storeContext'
import ExportStacked from '../components/Export/ExportStacked'
import ExportFlexed from '../components/Export/ExportFlexed'
import Layout from '../components/Layout'

const Export = () => {
  const store = useContext(storeContext)
  const { stacked } = store

  return <Layout>{stacked ? <ExportStacked /> : <ExportFlexed />}</Layout>
}

export default observer(Export)

export const Head = () => <Header />
