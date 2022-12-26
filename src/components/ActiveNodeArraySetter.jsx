import { useContext, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useLocation, useNavigate } from 'react-router-dom'
import {navigate} from '@reach/router'

import storeContext from '../storeContext'
import getActiveNodeArrayFromPathname from '../modules/getActiveNodeArrayFromPathname'

const ActiveNodeArraySetter = () => {
  const store = useContext(storeContext)
  const { setActiveNodeArray } = store
  const { pathname } = useLocation()
  const navigateReactRouter = useNavigate()

  console.log('ActiveNodeArraySetter', { pathname })

  useEffect(() => {
    console.log('ActiveNodeArraySetter: setting activeNodeArray')
    setActiveNodeArray(getActiveNodeArrayFromPathname(), navigateReactRouter, navigate)
  }, [navigateReactRouter, pathname, setActiveNodeArray])
}

export default observer(ActiveNodeArraySetter)
