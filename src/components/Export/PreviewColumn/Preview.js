import React, { useState, useCallback, useContext } from 'react'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import styled from '@emotion/styled'
import { gql, useApolloClient } from '@apollo/client'
import { useQuery } from '@tanstack/react-query'
import { observer } from 'mobx-react-lite'
import { getSnapshot } from 'mobx-state-tree'

import exportXlsx from '../../../modules/exportXlsx'
import exportCsv from '../../../modules/exportCsv'
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
    ? [...new Set(pcoFilters.map((f) => f.pcname))]
    : []
  const rcoFilters = getSnapshot(rcoFiltersPassed)
  const pcsOfRcoFilters = rcoFilters?.length
    ? [...new Set(rcoFilters.map((f) => f.pcname))]
    : []
  const taxFilters = getSnapshot(taxFiltersPassed)
  const rcoProperties = getSnapshot(rcoPropertiesPassed)
  const pcoProperties = getSnapshot(pcoPropertiesPassed)
  const taxFields = getSnapshot(taxPropertiesPassed)
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

  const newCount = exportData?.data?.exportAll?.exportDatum?.count
  const newRows = exportData?.data?.exportAll?.exportDatum?.exportData
    ? JSON.parse(exportData?.data?.exportAll?.exportDatum?.exportData)
    : []

  console.log('Preview, exportData:', {
    exportData,
    exportLoading,
    exportError,
    taxFields,
    newCount,
    newRows,
    pcoFilters,
    pcsOfPcoFilters,
  })

  const [message, setMessage] = useState('')

  const onSetMessage = useCallback((message) => {
    setMessage(message)
    if (message) {
      setTimeout(() => setMessage(''), 5000)
    }
  }, [])

  const fields = newRows[0] ? Object.keys(newRows[0]).map((k) => k) : []
  const pvColumns = fields.map((k) => ({
    key: k,
    name: k,
    resizable: true,
    sortable: true,
  }))

  const anzFelder = fields.length ?? 0

  const onClickXlsx = useCallback(() => {
    // TODO:
    // 1. download the full rows
    // 2. rowsFromObjects
    exportXlsx({ newRows, onSetMessage })
  }, [newRows, onSetMessage])
  const onClickCsv = useCallback(() => exportCsv(newRows), [newRows])

  if (exportError) {
    return (
      <ErrorContainer>
        `Error fetching data: ${exportError.message}`
      </ErrorContainer>
    )
  }

  return (
    <ErrorBoundary>
      <Container>
        {newCount > 0 && (
          <SpreadsheetContainer>
            <TotalDiv>{`${newCount.toLocaleString(
              'de-CH',
            )} Datensätze, ${anzFelder.toLocaleString('de-CH')} ${
              anzFelder === 1 ? 'Feld' : 'Felder'
            }`}</TotalDiv>
            {!isSSR && (
              <React.Suspense fallback={<div />}>
                <ReactDataGridLazy
                  columns={pvColumns}
                  rowGetter={(i) => newRows[i]}
                  rowsCount={newRows.length}
                  minHeight={500}
                  minColumnWidth={120}
                />
              </React.Suspense>
            )}
          </SpreadsheetContainer>
        )}
        {newCount === 0 && (
          <SpreadsheetContainer>
            <TotalDiv>{`${newCount.toLocaleString(
              'de-CH',
            )} Datensätze`}</TotalDiv>
          </SpreadsheetContainer>
        )}
        {newCount > 0 && (
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
        <StyledSnackbar open={exportLoading} message="Lade Daten..." />
      </Container>
    </ErrorBoundary>
  )
}

export default observer(Preview)
