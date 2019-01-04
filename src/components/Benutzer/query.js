// @flow
import gql from 'graphql-tag'

export default gql`
  query userQuery($id: UUID!) {
    login @client {
      token
      username
    }
    userById(id: $id) {
      id
      name
      email
      organizationUsersByUserId {
        nodes {
          id
          organizationByOrganizationId {
            id
            name
          }
          role
        }
      }
      propertyCollectionsByImportedBy {
        nodes {
          id
          name
        }
      }
      taxonomiesByImportedBy {
        nodes {
          id
          name
        }
      }
    }
  }
`