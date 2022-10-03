import React, { useState, useEffect, useCallback, useContext } from 'react'
import styled from 'styled-components'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import debounce from 'lodash/debounce'
import { observer } from 'mobx-react-lite'
import loadable from '@loadable/component'
import { Router } from '@reach/router'

import ErrorBoundary from './shared/ErrorBoundary'
import Layout from './Layout'
//import LazyImportFallback from './shared/LazyImportFallback'
import storeContext from '../storeContext'

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`

// ReactDOMServer does not yet support Suspense
//const Export = lazy(() => import('./Export'))
const Export = loadable(() => import('./Export'))
//const Login = lazy(() => import('./Login'))
const Login = loadable(() => import('./Login'))
//const Data = lazy(() => import('./Data'))
const Data = loadable(() => import('./Data'))
//const FourOhFour = lazy(() => import('./FourOhFour'))
const FourOhFour = loadable(() => import('./FourOhFour'))
//const GraphIql = lazy(() => import('./GraphIql'))
const GraphIql = loadable(() => import('./GraphIql'))

const App = () => {
  const store = useContext(storeContext)
  const { updateAvailable, setWindowWidth, setWindowHeight } = store

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

  const onClickReload = useCallback(
    () => typeof window !== 'undefined' && window.location.reload(false),
    [],
  )

  return (
    <ErrorBoundary>
      <Container>
        <Layout>
          <Router>
            <Data stacked={stacked} path="/*" />
            <Export stacked={stacked} path="Export" />
            <Login path="/Login" />
            <GraphIql path="/graphiql" />
            <FourOhFour default />
          </Router>
          <Snackbar
            open={updateAvailable}
            message={
              <span id="message-id">
                Für arteigenschaften.ch ist ein Update verfügbar
              </span>
            }
            action={
              <Button
                key="undo"
                color="primary"
                size="small"
                onClick={onClickReload}
              >
                neu laden
              </Button>
            }
          />
        </Layout>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(App)
