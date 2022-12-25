import React from 'react'
import styled from '@emotion/styled'
import { Router } from '@reach/router'

import ErrorBoundary from './shared/ErrorBoundary'
import Layout from './Layout'
import Login from './Login'
import Data from './Data'

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`

const App = () => (
  <ErrorBoundary>
    <Container>
      <Layout>
        <Router>
          <Data path="/*" />
          <Login path="/Login" />
        </Router>
      </Layout>
    </Container>
  </ErrorBoundary>
)

export default App
