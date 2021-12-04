import React, {
  useState,
  useContext,
  useCallback,
  useMemo,
  useEffect,
} from 'react'
import styled from 'styled-components'
import Snackbar from '@mui/material/Snackbar'
import { useQuery, useApolloClient, gql } from '@apollo/client'
import { observer } from 'mobx-react-lite'
import { getSnapshot } from 'mobx-state-tree'
import { FixedSizeTree as Tree } from 'react-vtree'

import Row from './Row'
import Filter from './Filter'
import buildNodes from './buildNodes'
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
import buildLevel2TaxonomyNodes from './nodes/level2Taxonomy'

const singleRowHeight = 23
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
const AutoSizerContainer = styled.div`
  height: 100%;
  padding: 5px 0;
`

const getNodeData = ({ node, nestingLevel, client, nodes, setNodes }) => ({
  data: {
    fetch: async () => {
      console.log('node, fetch:', node)
      switch (node.id) {
        case 'Arten': {
          console.log('TODO:')
          const result = await client.query({
            query: gql`
              query TreeDataQueryForTaxonomyLevel2 {
                allTaxonomies(filter: { type: { equalTo: ART } }) {
                  totalCount
                  nodes {
                    id
                    name
                    type
                    objectsByTaxonomyId {
                      totalCount
                    }
                    topLevelObjects: objectsByTaxonomyId(
                      filter: { parentId: { isNull: true } }
                    ) {
                      totalCount
                    }
                  }
                }
              }
            `,
          })
          console.log('Tree, fetch, Arten, result:', result)
          const children = buildLevel2TaxonomyNodes({
            type: 'Arten',
            taxonomies: result?.data?.allTaxonomies?.nodes ?? [],
            taxonomySort: 1,
          })
          console.log('Tree, fetch, Arten, children:', children)
          const newNodes = [...nodes]
          const myNode = newNodes.find((n) => n.id === node.id)
          console.log('Tree, fetch, Arten, myNode:', myNode)
          myNode.children = children
          setNodes(newNodes)
          break
        }
        default:
          console.log('default, TODO:')
      }
      return
    },
    ...node,
    id: node.id.toString(), // mandatory
    isLeaf: node?.childrenCount === 0,
    isOpenByDefault: true, // mandatory
    nestingLevel,
  },
  nestingLevel,
  node,
})

const Node = (props) => {
  const { data, isOpen, style, setOpen, treeRefetch, userId } = props
  const [isLoading, setLoading] = useState(false)

  return (
    <Row
      style={style}
      data={data}
      treeRefetch={treeRefetch}
      userId={userId}
      loading={isLoading}
      setLoading={setLoading}
      setOpen={setOpen}
    />
  )
}

const TreeComponent = () => {
  //console.log('TreeComponent rendering')
  const store = useContext(storeContext)
  const { login } = store
  const activeNodeArray = getSnapshot(store.activeNodeArray)

  const client = useApolloClient()

  const {
    data: treeData = {},
    loading,
    error: treeError,
    refetch: treeRefetch,
  } = useQuery(treeQuery, {
    variables: {
      ...treeQueryVariables({ activeNodeArray }),
      username: login.username,
    },
  })

  const userId = treeData?.userByName?.id

  const [nodes, setNodes] = useState([])

  useEffect(() => {
    if (loading === false) {
      console.log('Tree, useEffect setting level 1 nodes')
      setNodes(
        buildLevel1Nodes({
          treeData,
          activeNodeArray,
          loading,
          store,
          client,
        }),
      )
    }
  }, [loading])

  console.log('Tree, nodes:', { nodes, loading, treeData, activeNodeArray })

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
          setNodes,
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
            setNodes,
          })
        }
      }
    },
    [nodes],
  )

  const { username } = login
  const organizationUsers = treeData?.allOrganizationUsers?.nodes ?? []
  const userRoles = organizationUsers
    .filter((oU) => username === oU?.userByUserId?.name ?? '')
    .map((oU) => oU.role)
  const userIsTaxWriter =
    userRoles.includes('orgAdmin') || userRoles.includes('orgTaxonomyWriter')

  //console.log('tree', { height, width })

  // const listRef = useRef(null)

  if (treeError) {
    return (
      <ErrorContainer>{`Error fetching data: ${treeError.message}`}</ErrorContainer>
    )
  }

  return (
    <ErrorBoundary>
      <Container
      //ref={sizeRef}
      >
        <Filter />
        <AutoSizerContainer>
          {nodes.length ? (
            <Tree
              treeWalker={treeWalker}
              itemSize={30}
              //height={height - 35 - 10 - 3}
              height={800}
              width="100%"
              async={true}
            >
              {(props) =>
                Node({
                  data: props.data,
                  isOpen: props.isOpen,
                  isCrolling: props.isScrolling,
                  setOpen: props.setOpen,
                  style: props.style,
                  userId,
                  treeRefetch,
                })
              }
            </Tree>
          ) : null}
        </AutoSizerContainer>
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
