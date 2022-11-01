import React from 'react'
import styled from 'styled-components'

import AppBar from './AppBar'

const Container = styled.div`
  @media print {
    height: auto;
    overflow: visible !important;
  }
`

const Layout = ({ children }) => (
  <Container>
    <html lang="de" />
    <AppBar />
    {children}
  </Container>
)

export default Layout
