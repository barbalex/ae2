import React, { useState, useEffect, useCallback, useContext } from 'react'
import styled from '@emotion/styled'
import debounce from 'lodash/debounce'
import { observer } from 'mobx-react-lite'
import { Router } from '@reach/router'

import ErrorBoundary from './shared/ErrorBoundary'
import Layout from './Layout'
import storeContext from '../storeContext'
import Export from './Export'
import Login from './Login'
import Data from './Data'
import FourOhFour from './FourOhFour'

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`

const App = () => {
  const store = useContext(storeContext)
  const { setWindowWidth, setWindowHeight } = store

  const [stacked, setStacked] = useState(false)

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
  }, [setWindowHeight, setWindowWidth])

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

  return (
    <ErrorBoundary>
      <Container>
        <Layout>
          <Router>
            <Data stacked={stacked} path="/*" />
            {/* <Export stacked={stacked} path="Export" /> */}
            <Login path="/Login" />
            <FourOhFour default />
          </Router>
        </Layout>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(App)
