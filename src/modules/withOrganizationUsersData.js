// @flow
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

export default graphql(
  gql`
    query AllOrganizationUsersQuery {
      allOrganizationUsers {
        nodes {
          id
          nodeId
          organizationId
          userId
          role
          userByUserId {
            id
            name
          }
        }
      }
    }
  `,
  {
    name: 'organizationUsersData',
  },
)