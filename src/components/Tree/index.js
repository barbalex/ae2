import React, { useMemo, useContext, useEffect, useRef } from 'react'
import styled from '@emotion/styled'
import Snackbar from '@mui/material/Snackbar'
import { useApolloClient } from '@apollo/client'
import { observer } from 'mobx-react-lite'
import { getSnapshot } from 'mobx-state-tree'
import { FixedSizeList as List } from 'react-window'
import SimpleBar from 'simplebar-react'
import findIndex from 'lodash/findIndex'
import isEqual from 'lodash/isEqual'
import { useResizeDetector } from 'react-resize-detector'
import { useQuery } from '@tanstack/react-query'

import Row from './Row'
import Filter from './Filter'
import treeQuery from './treeQuery'
import CmBenutzerFolder from './contextmenu/BenutzerFolder'
import CmBenutzer from './contextmenu/Benutzer'
import CmObject from './contextmenu/Object'
import CmTaxonomy from './contextmenu/Taxonomy'
import CmType from './contextmenu/Type'
import CmPCFolder from './contextmenu/PCFolder'
import CmPC from './contextmenu/PC'
import storeContext from '../../storeContext'
import ErrorBoundary from '../shared/ErrorBoundary'
import getTreeDataVariables from './treeQueryVariables'
import getConstants from '../../modules/constants'

const constants = getConstants()

const ErrorContainer = styled.div`
  padding: 24px;
`
const Container = styled.div`
  height: 100%;
  /*display: flex;
  flex-direction: column;
  overflow: hidden;*/
  ul {
    margin: 0;
    list-style: none;
    padding: 0 0 0 1.1em;
  }

  /*
   * context menu
   */

  .react-contextmenu {
    display: flex;
    flex-direction: column;
    min-width: 100px;
    padding: 5px 0;
    margin: 2px 0 0;
    font-size: 14px;
    text-align: left;
    background-color: rgb(66, 66, 66);
    background-clip: padding-box;
    border: 1px solid grey;
    border-radius: 0.25rem;
    outline: none;
    opacity: 0;
    pointer-events: none;
    font-family: 'Roboto', sans-serif;
  }

  .react-contextmenu.react-contextmenu--visible {
    color: white;
    opacity: 1;
    pointer-events: auto;
    z-index: 1000;
  }

  .react-contextmenu-title {
    opacity: 0;
  }

  .react-contextmenu--visible .react-contextmenu-title {
    color: #b3b3b3;
    padding-left: 10px;
    padding-right: 15px;
    padding-bottom: 3px;
    opacity: 1;
  }

  .react-contextmenu > .react-contextmenu-item {
    display: inline-block;
    padding: 3px 20px;
    clear: both;
    font-weight: 400;
    line-height: 1.5;
    color: white;
    text-align: inherit;
    white-space: nowrap;
    background: 0 0;
    border: 0;
    text-decoration: none;
    cursor: pointer;
  }

  .react-contextmenu-item.active,
  .react-contextmenu-item:hover {
    color: #f57c00;
    border-color: #0275d8;
    text-decoration: none;
  }
  .react-contextmenu-divider {
    border-top: 1px solid grey;
    margin-top: 4px;
    margin-bottom: 7px;
  }
  .react-contextmenu-submenu {
    padding-right: 27px !important;
  }

  .react-contextmenu-submenu:after {
    content: '▶';
    display: inline-block;
    position: absolute;
    right: 7px;
    bottom: 3px;
  }
`
const AutoSizerContainer = styled.div`
  height: calc(100vh - ${constants.appBarHeight}px - 39px);
  padding: 0;
`
const StyledSnackbar = styled(Snackbar)`
  div {
    min-width: auto;
    background-color: #2e7d32 !important;
    /* for unknown reason only this snackbar gets
     * flex-grow 1 set
     * which makes it fill 100% width
     */
    flex-grow: 0;
  }
`
const StyledList = styled(List)`
  overflow-x: hidden !important;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;

  /* hide native scrollbar */
  &::-webkit-scrollbar {
    width: 1px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
    box-shadow: none;
  }
  &::-webkit-scrollbar-thumb {
    background-color: transparent;
    box-shadow: none;
  }
  /* &::-webkit-scrollbar-thumb:hover {
    background: '#6B2500';
  } */
`

const TreeComponent = () => {
  const store = useContext(storeContext)
  const { activeNodeArray: activeNodeArrayProxy } = store
  const activeNodeArray = getSnapshot(activeNodeArrayProxy)

  const {
    height = 250,
    width = 250,
    ref: sizeRef,
  } = useResizeDetector({
    refreshMode: 'debounce',
    refreshRate: 500,
    refreshOptions: { leading: true },
  })

  const variables = getTreeDataVariables(store)

  const client = useApolloClient()

  // TODO: not registering changes?
  // or is only url changed but not activeNodeArray?
  console.log('TreeComponent', {
    activeNodeArray,
    variables,
  })

  useEffect(() => console.log('TreeComponent first render'), [])

  const { isLoading, error, data } = useQuery({
    queryKey: ['treeQuery', variables],
    queryFn: () =>
      client.query({
        query: treeQuery,
        variables,
        // seems that react-query cache is not working
        // no idea why
        // fetchPolicy: 'no-cache',
      }),
  })

  const previousData = useRef(null)

  // if isLoading, return previous value to avoid flickering
  const nodes = useMemo(() => {
    if (isLoading) {
      console.log('Tree, memo', {
        isLoading,
        previousData: previousData.current,
        data,
      })
      return previousData.current ?? []
    }
    if (data?.data?.treeFunction?.nodes) {
      previousData.current = data?.data?.treeFunction?.nodes
      return data?.data?.treeFunction?.nodes
    }
    return []
  }, [data, isLoading])

  const listRef = useRef(null)

  useEffect(() => {
    const index = findIndex(nodes, (node) => isEqual(node.url, activeNodeArray))
    listRef?.current?.scrollToItem(index)
  }, [activeNodeArray, nodes])

  const userId = data?.data?.userByName?.id

  const userRoles = (
    data?.data?.userByName?.organizationUsersByUserId?.nodes ?? []
  ).map((r) => r?.role)
  const userIsTaxWriter =
    userRoles.includes('orgAdmin') || userRoles.includes('orgTaxonomyWriter')

  if (error) {
    return (
      <ErrorContainer>{`Error fetching data: ${error.message}`}</ErrorContainer>
    )
  }

  return (
    <ErrorBoundary>
      <Container>
        <Filter />
        <SimpleBar
          style={{
            height: `calc(100vh - ${constants.appBarHeight}px - 39px)`,
            flex: '1 1 auto',
            overflowY: 'auto',
          }}
        >
          {({ scrollableNodeRef, contentNodeRef }) => {
            return (
              <AutoSizerContainer ref={sizeRef}>
                <StyledList
                  height={height}
                  itemCount={nodes.length}
                  itemSize={23}
                  width={width}
                  ref={listRef}
                  innerRef={contentNodeRef}
                  outerRef={scrollableNodeRef}
                >
                  {({ index, style }) => (
                    <Row
                      key={index}
                      style={style}
                      index={index}
                      data={nodes[index]}
                      userId={userId}
                    />
                  )}
                </StyledList>
              </AutoSizerContainer>
            )
          }}
        </SimpleBar>
        <StyledSnackbar open={isLoading} message="lade Daten..." />
        <CmBenutzerFolder />
        <CmBenutzer />
        {userIsTaxWriter && (
          <>
            <CmObject />
            <CmTaxonomy />
            <CmType />
            <CmPCFolder />
            <CmPC />
          </>
        )}
      </Container>
    </ErrorBoundary>
  )
}

export default observer(TreeComponent)
