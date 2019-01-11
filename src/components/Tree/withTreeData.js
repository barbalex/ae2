// @flow
import { graphql } from 'react-apollo'
import get from 'lodash/get'

import treeDataQuery from './treeDataQuery'
import treeDataVariables from './treeDataVariables'

export default graphql(treeDataQuery, {
  options: ({ activeNodeArrayData }: { activeNodeArrayData: Object }) => {
    const activeNodeArray = get(activeNodeArrayData, 'activeNodeArray', [])
    const variables = treeDataVariables({ activeNodeArray })

    return { variables }
  },
  name: 'treeData',
})
