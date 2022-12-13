import React, { useState, useCallback, useContext } from 'react'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import styled from '@emotion/styled'
import orderBy from 'lodash/orderBy'
import { gql, useApolloClient } from '@apollo/client'
import { useQuery } from '@tanstack/react-query'
import { observer } from 'mobx-react-lite'
import { getSnapshot } from 'mobx-state-tree'

import exportXlsx from '../../../modules/exportXlsx'
import exportCsv from '../../../modules/exportCsv'
import rowsFromObjects from './rowsFromObjects'
import storeContext from '../../../storeContext'
import ErrorBoundary from '../../shared/ErrorBoundary'

// react-data-grid calls window!
const ReactDataGridLazy = React.lazy(() => import('react-data-grid'))

const Container = styled.div`
  padding-top: 5px;
  .react-grid-Container {
    font-size: small;
  }
  .react-grid-Header {
  }
  .react-grid-HeaderRow {
    overflow: hidden;
  }
  .react-grid-HeaderCell:not(:first-of-type) {
    border-left: #c7c7c7 solid 1px !important;
  }
  .react-grid-HeaderCell__draggable {
    right: 16px !important;
  }
  .react-grid-Cell {
    border: #ddd solid 1px !important;
  }
`
const ErrorContainer = styled.div`
  padding: 9px;
`
const SpreadsheetContainer = styled.div`
  display: flex;
  flex-direction: column;
`
const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  padding: 0 8px;
`
const TotalDiv = styled.div`
  font-size: small;
  padding-left: 9px;
  margin-top: 4px;
`
const StyledButton = styled(Button)`
  border: 1px solid !important;
`
const StyledSnackbar = styled(Snackbar)`
  div {
    min-width: auto;
    background-color: #2e7d32 !important;
  }
`
const exportMutation = gql`
  mutation exportDataMutation(
    $taxonomies: [String]!
    $taxFields: [TaxFieldInput]!
    $taxFilters: [TaxFilterInput]!
    $pcoFilters: [PcoFilterInput]!
    $pcsOfPcoFilters: [String]!
    $pcsOfRcoFilters: [String]!
    $pcoProperties: [PcoPropertyInput]!
    $rcoFilters: [RcoFilterInput]!
    $rcoProperties: [RcoPropertyInput]!
    $useSynonyms: Boolean!
    $count: Int!
    $objectIds: [UUID]!
    $rowPerRco: Boolean!
  ) {
    exportAll(
      input: {
        taxonomies: $taxonomies
        taxFields: $taxFields
        taxFilters: $taxFilters
        pcoFilters: $pcoFilters
        pcsOfPcoFilters: $pcsOfPcoFilters
        pcsOfRcoFilters: $pcsOfRcoFilters
        pcoProperties: $pcoProperties
        rcoFilters: $rcoFilters
        rcoProperties: $rcoProperties
        useSynonyms: $useSynonyms
        count: $count
        objectIds: $objectIds
        rowPerRco: $rowPerRco
      }
    ) {
      exportDatum {
        id
        count
        exportData
      }
    }
  }
`
const exportObjectQuery = gql`
  query PreviewColumnExportObjectQuery(
    $exportTaxonomies: [String]!
    $taxFilters: [TaxFilterInput]!
    $fetchTaxProperties: Boolean!
  ) {
    exportObject(exportTaxonomies: $exportTaxonomies, taxFilters: $taxFilters) {
      totalCount
      nodes {
        id
        properties @include(if: $fetchTaxProperties)
      }
    }
  }
`
const exportPcoQuery = gql`
  query exportPcoQuery(
    $exportTaxonomies: [String]!
    $pcoFilters: [PcoFilterInput]!
    $pcoProperties: [PcoPropertyInput]!
    $fetchPcoProperties: Boolean!
  ) {
    exportPco(
      exportTaxonomies: $exportTaxonomies
      pcoFilters: $pcoFilters
      pcoProperties: $pcoProperties
    ) @include(if: $fetchPcoProperties) {
      totalCount
      nodes {
        id
        objectId
        propertyCollectionId
        propertyCollectionOfOrigin
        properties
      }
    }
  }
`
const exportRcoQuery = gql`
  query exportRcoQuery(
    $exportTaxonomies: [String]!
    $rcoFilters: [RcoFilterInput]!
    $rcoProperties: [RcoPropertyInput]!
    $fetchRcoProperties: Boolean!
  ) {
    exportRco(
      exportTaxonomies: $exportTaxonomies
      rcoFilters: $rcoFilters
      rcoProperties: $rcoProperties
    ) @include(if: $fetchRcoProperties) {
      totalCount
      nodes {
        id
        propertyCollectionId
        objectId
        objectIdRelation
        objectByObjectIdRelation {
          id
          name
          taxonomyByTaxonomyId {
            id
            name
          }
        }
        propertyCollectionByPropertyCollectionId {
          id
          name
        }
        propertyCollectionOfOrigin
        relationType
        properties
      }
    }
  }
`
const synonymQuery = gql`
  query exportSynonymQuery($exportTaxonomies: [String!]) {
    allSynonyms(
      filter: {
        objectByObjectId: {
          taxonomyByTaxonomyId: { name: { in: $exportTaxonomies } }
        }
      }
    ) {
      nodes {
        objectId
        objectIdSynonym
      }
    }
  }
`

const Preview = () => {
  const client = useApolloClient()
  const isSSR = typeof window === 'undefined'
  const store = useContext(storeContext)
  const {
    withSynonymData,
    pcoFilters: pcoFiltersPassed,
    rcoFilters: rcoFiltersPassed,
    taxFilters: taxFiltersPassed,
    rcoProperties: rcoPropertiesPassed,
    pcoProperties: pcoPropertiesPassed,
    taxProperties: taxPropertiesPassed,
    rcoInOneRow,
  } = store.export
  // 2019 08 20: No idea why suddenly need to getSnapshot
  // because without changes are not detected????
  const pcoFilters = getSnapshot(pcoFiltersPassed)
  const pcsOfPcoFilters = pcoFilters?.length
    ? [new Set(pcoFilters.map((f) => f.pcname))]
    : []
  const rcoFilters = getSnapshot(rcoFiltersPassed)
  const pcsOfRcoFilters = rcoFilters?.length
    ? [new Set(rcoFilters.map((f) => f.pcname))]
    : []
  const taxFilters = getSnapshot(taxFiltersPassed)
  const rcoProperties = getSnapshot(rcoPropertiesPassed)
  const pcoProperties = getSnapshot(pcoPropertiesPassed)
  const taxFields = getSnapshot(taxPropertiesPassed)
  const fetchTaxProperties = taxFields.length > 0
  const taxonomies = store.export.taxonomies.toJSON()
  const exportIds = store.export.ids.toJSON()

  const {
    isLoading: exportLoading,
    error: exportError,
    data: exportData,
  } = useQuery({
    queryKey: [
      'exportQuery',
      taxonomies,
      taxFields,
      taxFilters,
      pcoFilters,
      pcsOfPcoFilters,
      pcsOfRcoFilters,
      pcoProperties,
      rcoFilters,
      rcoProperties,
      withSynonymData,
      exportIds,
      rcoInOneRow,
    ],
    queryFn: async () => {
      if (taxonomies.length === 0) return []

      const data = await client.mutate({
        mutation: exportMutation,
        variables: {
          taxonomies,
          taxFields,
          taxFilters,
          pcoFilters,
          pcsOfPcoFilters,
          pcsOfRcoFilters,
          pcoProperties,
          rcoFilters,
          rcoProperties,
          useSynonyms: withSynonymData,
          count: 13,
          objectIds: exportIds,
          rowPerRco: !rcoInOneRow,
        },
      })
      return data
    },
  })

  const newRows = exportData?.data?.export?.rows ?? []

  console.log('Preview, exportData:', {
    exportData,
    exportLoading,
    exportError,
    taxFields,
  })

  const {
    isLoading: exportObjectLoading,
    error: exportObjectError,
    data: exportObjectData,
  } = useQuery({
    queryKey: ['exportObjectQuery', taxonomies, taxFilters, fetchTaxProperties],
    queryFn: async () => {
      if (taxonomies.length === 0) return []

      const data = await client.query({
        query: exportObjectQuery,
        variables: {
          exportTaxonomies: taxonomies,
          taxFilters,
          fetchTaxProperties,
        },
      })
      return data
    },
  })

  const objects = exportObjectData?.data?.exportObject?.nodes ?? []

  console.log('Preview rendering', {
    exportTaxonomies: taxonomies,
    exportObjectData,
    pcoFilters,
    pcoProperties,
    exportPcoData,
  })

  const {
    isLoading: synonymLoading,
    error: synonymError,
    data: synonymData,
  } = useQuery({
    queryKey: ['synonymQuery', taxonomies],
    queryFn: async () => {
      if (taxonomies.length === 0) return []
      const data = await client.query({
        query: synonymQuery,
        variables: { exportTaxonomies: taxonomies },
      })
      return data
    },
  })

  const {
    isLoading: exportPcoLoading,
    error: exportPcoError,
    data: exportPcoData,
  } = useQuery({
    queryKey: ['exportPcoQuery', taxonomies, pcoFilters, pcoProperties],
    queryFn: async () =>
      client.query({
        query: exportPcoQuery,
        variables: {
          exportTaxonomies: taxonomies,
          pcoFilters,
          pcoProperties,
          fetchPcoProperties: pcoProperties.length > 0,
        },
      }),
  })

  const {
    isLoading: exportRcoLoading,
    error: exportRcoError,
    data: exportRcoData,
  } = useQuery({
    queryKey: ['exportRcoQuery', taxonomies, rcoFilters, rcoProperties],
    queryFn: () =>
      client.query({
        query: exportRcoQuery,
        variables: {
          exportTaxonomies: taxonomies,
          rcoFilters,
          rcoProperties,
          fetchRcoProperties: rcoProperties.length > 0,
        },
      }),
  })

  const [message, setMessage] = useState('')

  const onSetMessage = useCallback((message) => {
    setMessage(message)
    if (message) {
      setTimeout(() => setMessage(''), 5000)
    }
  }, [])

  const exportRcoPropertyNames = rcoProperties.map((p) => p.pname)
  const objectsCount = exportObjectData?.data?.exportObject?.totalCount
  const pco = exportPcoData?.data?.exportPco?.nodes ?? []
  const rco = exportRcoData?.data?.exportRco?.nodes ?? []
  const synonyms = synonymData?.data?.allSynonyms?.nodes ?? []

  // need taxFields to filter only data with properties
  const rowsResult = rowsFromObjects({
    objects,
    taxProperties: taxFields,
    withSynonymData,
    rcoInOneRow,
    pcoProperties,
    pco,
    rco,
    synonyms,
    exportRcoPropertyNames,
    rcoProperties,
    exportIds,
  })
  const rows = rowsResult?.rows
  const pvColumns = rowsResult?.pvColumns ?? []

  console.log('Preview', { pvColumns, rows })

  const anzFelder = rows?.[0] ? Object.keys(rows[0]).length : 0
  const loading =
    exportRcoLoading ||
    exportObjectLoading ||
    exportPcoLoading ||
    synonymLoading

  const onClickXlsx = useCallback(() => {
    // TODO:
    // 1. download the full rows
    // 2. rowsFromObjects
    exportXlsx({ rows, onSetMessage })
  }, [rows, onSetMessage])
  const onClickCsv = useCallback(() => exportCsv(rows), [rows])

  if (exportObjectError) {
    return (
      <ErrorContainer>
        `Error fetching data: ${exportObjectError.message}`
      </ErrorContainer>
    )
  }
  if (synonymError) {
    return (
      <ErrorContainer>
        `Error fetching data: ${synonymError.message}`
      </ErrorContainer>
    )
  }
  if (exportPcoError) {
    return (
      <ErrorContainer>
        `Error fetching data: ${exportPcoError.message}`
      </ErrorContainer>
    )
  }
  if (exportRcoError) {
    return (
      <ErrorContainer>
        `Error fetching data: ${exportRcoError.message}`
      </ErrorContainer>
    )
  }

  return (
    <ErrorBoundary>
      <Container>
        {objectsCount > 0 && (
          <SpreadsheetContainer>
            <TotalDiv>{`${objectsCount.toLocaleString(
              'de-CH',
            )} Datensätze, ${anzFelder.toLocaleString('de-CH')} ${
              anzFelder === 1 ? 'Feld' : 'Felder'
            }`}</TotalDiv>
            {!isSSR && (
              <React.Suspense fallback={<div />}>
                <ReactDataGridLazy
                  columns={pvColumns}
                  rowGetter={(i) => rows[i]}
                  rowsCount={rows.length}
                  minHeight={500}
                  minColumnWidth={120}
                />
              </React.Suspense>
            )}
          </SpreadsheetContainer>
        )}
        {objectsCount === 0 && (
          <SpreadsheetContainer>
            <TotalDiv>{`${objectsCount.toLocaleString(
              'de-CH',
            )} Datensätze`}</TotalDiv>
          </SpreadsheetContainer>
        )}
        {objectsCount > 0 && (
          <ButtonsContainer>
            <StyledButton onClick={onClickXlsx} color="inherit">
              .xlsx herunterladen
            </StyledButton>
            <StyledButton onClick={onClickCsv} color="inherit">
              .csv herunterladen
            </StyledButton>
          </ButtonsContainer>
        )}
        <StyledSnackbar open={!!message} message={message} />
        <StyledSnackbar open={loading} message="Lade Daten..." />
      </Container>
    </ErrorBoundary>
  )
}

export default observer(Preview)
