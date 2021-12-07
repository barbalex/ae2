import React, {
  useState,
  useContext,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import styled from 'styled-components'
import Snackbar from '@mui/material/Snackbar'
import { useApolloClient } from '@apollo/client'
import { observer } from 'mobx-react-lite'
import { getSnapshot } from 'mobx-state-tree'
import { FixedSizeTree } from 'react-vtree'
import AutoSizer from 'react-virtualized-auto-sizer'

import Row from './Row'
import Filter from './Filter'
import treeQuery from './treeQuery'
import treeQueryVariables from './treeQueryVariables'
import CmBenutzerFolder from './contextmenu/BenutzerFolder'
import CmBenutzer from './contextmenu/Benutzer'
import CmObject from './contextmenu/Object'
import CmTaxonomy from './contextmenu/Taxonomy'
import CmType from './contextmenu/Type'
import CmPCFolder from './contextmenu/PCFolder'
import CmPC from './contextmenu/PC'
import storeContext from '../../storeContext'
import ErrorBoundary from '../shared/ErrorBoundary'
import buildLevel1Nodes from './nodes/level1'

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
const StyledTree = styled(FixedSizeTree)`
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px !important;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 4px;
    box-shadow: inset 0 0 7px #e65100;
  }
  ::-webkit-scrollbar-track {
    border-radius: 1rem;
    box-shadow: none;
  }
`

const getNodeData = ({ node, nestingLevel }) => ({
  data: {
    ...node,
    id: node.id.toString(), // mandatory
    isLeaf: node?.childrenCount === 0,
    isOpenByDefault: true, // mandatory
    nestingLevel,
  },
  nestingLevel,
  node,
})

const TreeComponent = () => {
  const store = useContext(storeContext)
  const { login } = store
  const activeNodeArray = getSnapshot(store.activeNodeArray)
  //const activeNodeArray = store.activeNodeArray.slice()

  const client = useApolloClient()

  const [data, setData] = useState({
    treeData: undefined,
    error: undefined,
    loading: true,
    nodes: buildLevel1Nodes({
      treeData: undefined,
      loading: true,
      activeNodeArray,
      store,
    }),
  })

  const { treeData, error, loading, nodes } = data

  const listRef = useRef(null)
  useEffect(() => {
    listRef?.current?.scrollToItem(activeNodeArray?.at(-1))
  }, [activeNodeArray, nodes])

  const userId = treeData?.userByName?.id

  useEffect(() => {
    client
      .query({
        query: treeQuery,
        variables: {
          ...treeQueryVariables({ activeNodeArray, store }),
          username: login.username ?? 'no_user_with_this_name_exists',
        },
      })
      .then(({ data: treeData, loading, error }) => {
        console.log('treeData:', treeData)
        setData({
          treeData,
          error,
          loading,
          nodes: buildLevel1Nodes({
            treeData,
            loading,
            activeNodeArray,
            store,
          }),
        })
      })
  }, [activeNodeArray, client, login.username, store])

  const treeWalker = useCallback(
    function* treeWalker() {
      // Step [1]: Define the root node of our tree. There can be one or
      // multiple nodes.
      for (let i = 0; i < nodes.length; i++) {
        yield getNodeData({
          node: nodes[i],
          nestingLevel: 0,
          client,
          nodes,
        })
      }

      while (true) {
        // Step [2]: Get the parent component back. It will be the object
        // the `getNodeData` function constructed, so you can read any data from it.
        const parent = yield

        for (let i = 0; i < parent.node.children.length; i++) {
          // Step [3]: Yielding all the children of the provided component. Then we
          // will return for the step [2] with the first children.
          yield getNodeData({
            node: parent.node.children[i],
            nestingLevel: parent.nestingLevel + 1,
            client,
            nodes,
          })
        }
      }
    },
    [client, nodes],
  )

  const userRoles = (
    treeData?.userByName?.organizationUsersByUserId?.nodes ?? []
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
        <AutoSizer>
          {({ height, width }) => (
            <StyledTree
              treeWalker={treeWalker}
              itemSize={23}
              height={height - 38}
              width={width}
              async={true}
              ref={listRef}
            >
              {(props) => (
                <Row style={props.style} data={props.data} userId={userId} />
              )}
            </StyledTree>
          )}
        </AutoSizer>
        <StyledSnackbar open={loading} message="lade Daten..." />
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
