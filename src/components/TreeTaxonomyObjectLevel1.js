// @flow
import React from 'react'
import { observer, inject } from 'mobx-react'
import compose from 'recompose/compose'
import { QueryRenderer, graphql } from 'react-relay'

import environment from '../modules/createRelayEnvironment'
import TreeTaxonomyObjectLevel2 from './TreeTaxonomyObjectLevel2'

const enhance = compose(inject('store'), observer)

const TreeTaxonomyObjectLevel1 = ({ store }: { store: Object }) => (
  <QueryRenderer
    environment={environment}
    query={graphql`
      query TreeTaxonomyObjectLevel1Query {
        taxonomyObjectLevel1 {
          totalCount
          nodes {
            id
            name
            taxonomyByTaxonomyId {
              category
              name
            }
          }
        }
      }
    `}
    render={({ error, props }) => {
      if (props) {
        if (props.taxonomyObjectLevel1) {
          const nodes = props.taxonomyObjectLevel1.nodes.map((n, index) => ({
            id: n.id,
            url: [
              'Taxonomien',
              n.taxonomyByTaxonomyId.category,
              n.taxonomyByTaxonomyId.name,
              n.name,
            ],
            label: n.name,
            hasChildren: true,
            parentId: 'level1_1',
          }))
          store.nodes.setTaxTaxonomyObjectsNodesLevel1(nodes)
        } else {
          store.nodes.setTaxTaxonomyObjectsNodesLevel1([])
        }
      }
      return <TreeTaxonomyObjectLevel2 />
    }}
  />
)

export default enhance(TreeTaxonomyObjectLevel1)
