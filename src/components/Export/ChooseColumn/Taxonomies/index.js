import React, { useContext } from 'react'
import styled from '@emotion/styled'
import Paper from '@mui/material/Paper'
import { observer } from 'mobx-react-lite'

import HowTo from './HowTo'
import ExportTypes from './ExportTypes'
import storeContext from '../../../../storeContext'
import ErrorBoundary from '../../../shared/ErrorBoundary'

const Container = styled.div`
  padding: 0 5px;
`
const PaperTextContainer = styled.div`
  padding: 16px;
`
const PropertyTextDiv = styled.div`
  padding-bottom: 5px;
`
const StyledPaper = styled(Paper)`
  width: 100%;
  color: white;
  background-color: ${(props) => `${props['data-bgcolor']} !important`};
  margin-bottom: 10px;
  margin-top: 10px;
`

const Taxonomies = () => {
  const store = useContext(storeContext)
  const { type: exportType } = store.export
  const exportTaxonomies = store.export.taxonomies.toJSON()

  let paperBackgroundColor = '#1565C0'
  let textProperties = 'Wählen Sie eine oder mehrere Taxonomien.'
  if (!exportType) {
    textProperties = 'Wählen Sie Arten oder Lebensräume.'
  }
  if (exportTaxonomies.length > 0) {
    paperBackgroundColor = '#2E7D32'
    textProperties = 'Die Eigenschaften wurden geladen.'
  }

  return (
    <ErrorBoundary>
      <Container>
        <HowTo />
        <ExportTypes />
        <StyledPaper elevation={1} data-bgcolor={paperBackgroundColor}>
          <PaperTextContainer>
            <PropertyTextDiv>{textProperties}</PropertyTextDiv>
          </PaperTextContainer>
        </StyledPaper>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(Taxonomies)
