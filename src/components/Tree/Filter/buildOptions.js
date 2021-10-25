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
    filterSuggestionsData,
    treeFilterText: treeFilter.text,
    treeFilterId,
  })

  const objectByObjectName =
    filterSuggestionsData?.objectByObjectName?.nodes ?? []
  const pCByPropertyName =
    filterSuggestionsData?.propertyCollectionByPropertyName?.nodes ?? []

  /**
   * need add type:
   * when suggestion is clicked,
   * url is calculated by id depending on type
   */
  const suggestionsArt = objectByObjectName
    .filter((n) => n?.taxonomyByTaxonomyId?.type === 'ART')
    .map((o) => ({
      val: o.id,
      label: `${o?.taxonomyByTaxonomyId?.name ?? ''}: ${o.name}`,
      type: 'art',
    }))
  const suggestionsLr = objectByObjectName
    .filter((n) => n?.taxonomyByTaxonomyId?.type === 'LEBENSRAUM')
    .map((o) => ({
      val: o.id,
      label: `${o?.taxonomyByTaxonomyId?.name ?? ''}: ${o.name}`,
      type: 'lr',
    }))
  const suggestionsPC = pCByPropertyName.map((s) => ({
    ...s,
    type: 'pC',
  }))
  const loadingOptions = [
    {
      title: 'Lade Daten',
      options: [
        {
          val: 'none',
          label: '',
          type: 'art',
        },
      ],
    },
  ]

  const options = []
  if (suggestionsArt.length) {
    options.push({
      label: `Arten (${suggestionsArt.length})`,
      options: suggestionsArt,
    })
  }
  if (suggestionsLr.length) {
    options.push({
      label: `Lebensräume (${suggestionsLr.length})`,
      options: suggestionsLr,
    })
  }
  if (suggestionsPC.length) {
    options.push({
      label: `Eigenschaften-Sammlungen (${suggestionsPC.length})`,
      options: suggestionsPC,
    })
  }

  console.log({
    options,
  })

  cb(options)
}

export default buildOptions
