import { useEffect, useCallback, useContext } from 'react'
import debounce from 'lodash/debounce'
import { observer } from 'mobx-react-lite'

import storeContext from '../storeContext'

const Stacker = () => {
  const store = useContext(storeContext)
  const { setWindowWidth, setWindowHeight, setStacked } = store

  const updateStacked = useCallback(() => {
    if (typeof window === 'undefined') return
    const w = window
    const d = document
    const e = d.documentElement
    const g = d.getElementsByTagName('body')[0]
    const windowWidth = w.innerWidth || e.clientWidth || g.clientWidth
    const windowHeight = w.innerHeight || e.clientHeight || g.clientHeight
    const shouldBeStacked = windowWidth < 700
    setStacked(shouldBeStacked)
    setWindowWidth(windowWidth)
    setWindowHeight(windowHeight)
  }, [setStacked, setWindowHeight, setWindowWidth])

  useEffect(() => {
    updateStacked()
  }, [updateStacked])

  useEffect(() => {
    typeof window !== 'undefined' &&
      window.addEventListener('resize', debounce(updateStacked, 100))
    return () => {
      typeof window !== 'undefined' &&
        window.removeEventListener('resize', updateStacked)
    }
  }, [updateStacked])

  return null
}

export default observer(Stacker)
