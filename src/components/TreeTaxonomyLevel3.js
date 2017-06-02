// @flow
import React from 'react'
import { QueryRenderer, graphql } from 'react-relay'
import { inject } from 'mobx-react'
import compose from 'recompose/compose'

import environment from '../modules/createRelayEnvironment'
import Tree from './Tree'
import sort from '../modules/nodes/sort'
import level0FromProps from '../modules/nodes/level0FromProps'
import taxonomyLevel1FromProps from '../modules/nodes/taxonomyLevel1FromProps'
import taxonomyLevel2FromProps from '../modules/nodes/taxonomyLevel2FromProps'
import taxonomyLevel3FromProps from '../modules/nodes/taxonomyLevel3FromProps'

const enhance = compose(inject('store'))

const TreeTaxonomyLevel3 = ({ store }: { store: Object }) => (
  <QueryRenderer
    environment={environment}
    query={graphql`
      query TreeTaxonomyLevel3Query($taxId: Uuid) {
        allDataTypes {
          nodes {
            nameGerman
            name
            propertyCollectionsByDataType {
              totalCount
            }
            relationCollectionsByDataType {
              totalCount
            }
            categoriesByDataType {
              totalCount
              nodes {
                id
                name
                taxonomiesByCategory(condition: {id: $taxId}) {
                  totalCount
                  nodes {
                    id
                    name
                    isCategoryStandard
                    taxonomyObjectsByTaxonomyId(condition: {level: 1}) {
                      totalCount
                      nodes {
                        id
                        name
                        taxonomyObjectsByParentId {
                          totalCount
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `}
    variables={{ taxId: store.activeNodeArray[2] || '' }}
    render={({ error, props }) => (
      <Tree
        nodes={sort([
          ...level0FromProps(props),
          ...taxonomyLevel1FromProps(store, props),
          ...taxonomyLevel2FromProps(store, props),
          ...taxonomyLevel3FromProps(store, props),
        ])}
      />
    )}
  />
)

export default enhance(TreeTaxonomyLevel3)
