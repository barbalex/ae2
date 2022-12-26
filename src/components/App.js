import React from 'react'
import styled from '@emotion/styled'
import { Router } from '@reach/router'

import ErrorBoundary from './shared/ErrorBoundary'
import Data from './Data'

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`

const App = () => (
  <ErrorBoundary>
    <Container>
      <Router>
        <Data path="/*" />
      </Router>
    </Container>
  </ErrorBoundary>
)

export default App
