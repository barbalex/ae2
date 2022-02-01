import { gql } from '@apollo/client'

export default gql`
  query TreeDataQuery($username: String!, $url: [String], $hasToken: Boolean!) {
    userByName(name: $username) {
      id
      organizationUsersByUserId {
        nodes {
          id
          role
        }
      }
    }
    treeFunction(activeUrl: $url, hasToken: $hasToken) {
      nodes {
        level
        label
        id
        url
        sort
        childrenCount
        info
        menuType
      }
    }
  }
`
