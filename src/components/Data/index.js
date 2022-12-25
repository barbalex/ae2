import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'

import DataStacked from './DataStacked'
import DataFlexed from './DataFlexed'
import storeContext from '../../storeContext'

const Data = () => {
  const store = useContext(storeContext)
  const { stacked } = store

  return stacked ? <DataStacked /> : <DataFlexed />
}

export default observer(Data)
