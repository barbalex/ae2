import { gql } from '@apollo/client'

const filterSuggestionsQuery = gql`
  query filterSuggestionsQuery($treeFilterText: String!, $run: Boolean!) {
    propertyCollectionByPropertyName(propertyName: $treeFilterText)
      @include(if: $run) {
      nodes {
        id
        name
      }
    }
    objectByObjectName(objectName: $treeFilterText) @include(if: $run) {
      nodes {
        id
        name
        taxonomyByTaxonomyId {
          id
          type
          name
        }
      }
    }
  }
`
const objectUrlQuery = gql`
  query objectUrlDataQuery($treeFilterId: UUID!, $run: Boolean!) {
    objectById(id: $treeFilterId) @include(if: $run) {
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
        type
        name
      }
    }
  }
`

const buildOptions = async ({ cb, client, treeFilter }) => {
  const treeFilterId = treeFilter.id ?? '99999999-9999-9999-9999-999999999999'
  const options = []
  let resultFilterSuggestionsQuery
  try {
    resultFilterSuggestionsQuery = await client.query({
      query: filterSuggestionsQuery,
      variables: {
        treeFilterText: treeFilter.text || 'ZZZZ',
        run: !!treeFilter.text,
      },
    })
  } catch (error) {
    console.log(error)
  }

  const filterSuggestionsData = resultFilterSuggestionsQuery?.data
  const filterSuggestionsError = resultFilterSuggestionsQuery?.error

  let resultObjectUrlQuery
  try {
    resultObjectUrlQuery = await client.query({
      query: objectUrlQuery,
      variables: {
        treeFilterId,
        run: !!treeFilter.id,
      },
    })
  } catch (error) {
    console.log(error)
  }

  const objectUrlData = resultObjectUrlQuery?.data
  const objectUrlError = resultObjectUrlQuery?.error

  const urlObject = objectUrlData?.objectById ?? {}

  console.log({
    objectUrlData,
    objectUrlError,
    filterSuggestionsData,
    filterSuggestionsError,
    treeFilterText: treeFilter.text,
    treeFilterId,
  })

  cb(options)
}

export default buildOptions
