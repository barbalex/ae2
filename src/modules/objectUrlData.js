// @flow
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import get from 'lodash/get'

export default graphql(
  gql`
    query objectUrlDataQuery($treeFilterId: Uuid!) {
      objectById(id: $treeFilterId) {
        id
        categoryByCategory {
          id
          name
          dataType
        }
        objectByParentId {
          id
          objectByParentId {
            id
            objectByParentId {
              id
              objectByParentId {
                id
                objectByParentId {
                  id
                  objectByParentId {
                    id
                  }
                }
              }
            }
          }
        }
        taxonomyByTaxonomyId {
          id
        }
      }
    }
  `,
  {
    options: ({ treeFilterData }: { treeFilterData: Object }) => ({
      variables: {
        treeFilterId:
          get(treeFilterData, 'treeFilter.id') ||
          '99999999-9999-9999-9999-999999999999',
      },
    }),
    name: 'objectUrlData',
  }
)
