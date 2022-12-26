import React from 'react'
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex'
import styled from '@emotion/styled'
import { Outlet } from 'react-router'

import Tree from '../Tree'
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
        <Outlet />
      </DataElement>
    </ReflexContainer>
  </ErrorBoundary>
)

export default DataFlexed
