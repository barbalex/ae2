import React from 'react'
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex'
import styled from '@emotion/styled'

import Tree from '../Tree'
import DataType from '../DataType'
import ErrorBoundary from '../shared/ErrorBoundary'

const DataElement = styled(ReflexElement)`
  overflow-x: hidden !important;
`

const DataFlexed = () => (
  <ErrorBoundary>
    <ReflexContainer orientation="vertical">
      <ReflexElement flex={0.35} className="tree-reflex-element">
        <Tree />
      </ReflexElement>
      <ReflexSplitter key="treeSplitter" />
      <DataElement>
        <DataType />
      </DataElement>
    </ReflexContainer>
  </ErrorBoundary>
)

export default DataFlexed
