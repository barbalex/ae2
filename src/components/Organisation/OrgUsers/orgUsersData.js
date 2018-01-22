// @flow
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import get from 'lodash/get'

import orgUsersGql from './orgUsersGql'

export default graphql(
  gql`
    query orgUsersQuery($name: String!) {
      organizationByName(name: $name) {
        id
        organizationUsersByOrganizationId {
          totalCount
          nodes {
            id
            organizationId
            userId
            nodeId
            userByUserId {
              id
              name
            }
            role
          }
        }
      }
      allUsers {
        nodes {
          id
          name
        }
      }
      allRoles {
        nodes {
          name
        }
      }
    }
  `,
  {
    options: ({ activeNodeArrayData }) => ({
      variables: {
        name: get(activeNodeArrayData, 'activeNodeArray', ['none', 'none'])[1],
      },
    }),
    name: 'orgUsersData',
  }
)
