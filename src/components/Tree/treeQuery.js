import { gql } from '@apollo/client'

export default gql`
  query TreeDataQuery(
    $existsLevel2Benutzer: Boolean!
    $username: String!
    $url: [String]
    $hasToken: Boolean!
  ) {
    userByName(name: $username) {
      id
      name
      email
      organizationUsersByUserId {
        nodes {
          id
          organizationId
          role
          organizationByOrganizationId {
            id
            name
          }
        }
      }
    }
    allUsers(orderBy: NAME_ASC) {
      totalCount
      nodes {
        id
        name @include(if: $existsLevel2Benutzer)
        email @include(if: $existsLevel2Benutzer)
        organizationUsersByUserId @include(if: $existsLevel2Benutzer) {
          nodes {
            id
            organizationId
            role
            organizationByOrganizationId {
              id
              name
            }
          }
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
