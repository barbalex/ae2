import React from 'react'
import styled from '@emotion/styled'

const Container = styled.div`
  padding: 10px;
`

const LazyImportFallback = () => <Container>Lade...</Container>

export default LazyImportFallback
