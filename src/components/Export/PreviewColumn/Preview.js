import React, { useState, useCallback, useContext, useMemo } from 'react'
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
import CountInput from './CountInput'

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
  margin-bottom: 1px;
  user-select: none;
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
    $pcoProperties: [PcoPropertyInput]!
    $rcoFilters: [RcoFilterInput]!
    $rcoProperties: [RcoPropertyInput]!
    $useSynonyms: Boolean!
    $count: Int!
    $objectIds: [UUID]!
    $rowPerRco: Boolean!
    $sortField: SortFieldInput
  ) {
    exportAll(
      input: {
        taxonomies: $taxonomies
        taxFields: $taxFields
        taxFilters: $taxFilters
        pcoFilters: $pcoFilters
        pcoProperties: $pcoProperties
        rcoFilters: $rcoFilters
        rcoProperties: $rcoProperties
        useSynonyms: $useSynonyms
        count: $count
        objectIds: $objectIds
        rowPerRco: $rowPerRco
        sortField: $sortField
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

const removeBadChars = (str) =>
  str
    .trim()
    .toLowerCase()
    .replaceAll(' ', '_')
    .replaceAll('(', '')
    .replaceAll(')', '')
    .replaceAll('-', '')
    .replaceAll('↵', '')

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
  const rcoFilters = getSnapshot(rcoFiltersPassed)
  const taxFilters = getSnapshot(taxFiltersPassed)
  const rcoProperties = getSnapshot(rcoPropertiesPassed)
  const pcoProperties = getSnapshot(pcoPropertiesPassed)
  const taxFields = getSnapshot(taxPropertiesPassed)
  const taxonomies = store.export.taxonomies.toJSON()
  const exportIds = store.export.ids.toJSON()

  const [count, setCount] = useState(15)
  const [sortField, setSortField] = useState()

  const onGridSort = useCallback(
    (column, direction) => {
      if (direction === 'NONE') return setSortField(undefined)
      // setSortFields
      // 1. build array of sortFields including their column name
      //    will be used to find the correct sortField
      const sortFieldsWithColumn = []
      taxFields.forEach((taxField) => {
        sortFieldsWithColumn.push({
          tname: 'object',
          pcname: taxField.taxname,
          pname: taxField.pname,
          relationtype: '',
          direction,
          columnName: removeBadChars(`${taxField.taxname}__${taxField.pname}`),
        })
      })
      pcoProperties.forEach((pcoProperty) => {
        sortFieldsWithColumn.push({
          tname: 'property_collection_object',
          pcname: pcoProperty.pcname,
          pname: pcoProperty.pname,
          relationtype: '',
          direction,
          columnName: removeBadChars(
            `${pcoProperty.pcname}__${pcoProperty.pname}`,
          ),
        })
      })
      rcoProperties.forEach((rcoProperty) => {
        sortFieldsWithColumn.push({
          tname: 'relation',
          pcname: rcoProperty.pcname,
          pname: rcoProperty.pname,
          relationtype: rcoProperty.relationtype,
          direction,
          columnName: removeBadChars(
            `${rcoProperty.pcname}__${rcoProperty.relationtype}__${rcoProperty.pname}`,
          ),
        })
      })
      // 2. find sortField, remove columnName, setSortFields
      const sortField = sortFieldsWithColumn.find(
        (sf) => sf.columnName === column,
      )

      if (sortField) {
        delete sortField.columnName
        setSortField(sortField)
      }
    },
    [pcoProperties, rcoProperties, taxFields],
  )

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
      pcoProperties,
      rcoFilters,
      rcoProperties,
      withSynonymData,
      exportIds,
      rcoInOneRow,
      sortField,
      count,
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
          pcoProperties,
          rcoFilters,
          rcoProperties,
          useSynonyms: withSynonymData,
          count,
          objectIds: exportIds,
          rowPerRco: !rcoInOneRow,
          sortField,
        },
      })
      return data
    },
  })

  const newCount = exportData?.data?.exportAll?.exportDatum?.count
  const rows = useMemo(
    () =>
      exportData?.data?.exportAll?.exportDatum?.exportData
        ? JSON.parse(exportData?.data?.exportAll?.exportDatum?.exportData)
        : [],
    [exportData?.data?.exportAll?.exportDatum?.exportData],
  )

  const [message, setMessage] = useState('')

  const onSetMessage = useCallback((message) => {
    setMessage(message)
    if (message) {
      setTimeout(() => setMessage(''), 5000)
    }
  }, [])

  const fields = rows[0] ? Object.keys(rows[0]).map((k) => k) : []
  const pvColumns = fields.map((k) => ({
    key: k,
    name: k,
    resizable: true,
    sortable: true,
  }))

  const anzFelder = fields.length ?? 0

  const onClickXlsx = useCallback(async () => {
    // 1. download the full rows
    // 2. rowsFromObjects
    const data = await client.mutate({
      mutation: exportMutation,
      variables: {
        taxonomies,
        taxFields,
        taxFilters,
        pcoFilters,
        pcoProperties,
        rcoFilters,
        rcoProperties,
        useSynonyms: withSynonymData,
        count: 0,
        objectIds: exportIds,
        rowPerRco: !rcoInOneRow,
        sortField,
      },
    })
    const rows = data?.data?.exportAll?.exportDatum?.exportData
      ? JSON.parse(data?.data?.exportAll?.exportDatum?.exportData)
      : []
    exportXlsx({ rows, onSetMessage })
  }, [
    client,
    exportIds,
    onSetMessage,
    pcoFilters,
    pcoProperties,
    rcoFilters,
    rcoInOneRow,
    rcoProperties,
    sortField,
    taxFields,
    taxFilters,
    taxonomies,
    withSynonymData,
  ])
  const onClickCsv = useCallback(() => exportCsv(rows), [rows])

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
            <TotalDiv>
              {`${newCount.toLocaleString(
                'de-CH',
              )} Datensätze, ${anzFelder.toLocaleString('de-CH')} ${
                anzFelder === 1 ? 'Feld' : 'Felder'
              }. Erste `}
              <CountInput count={count} setCount={setCount} />
              {' :'}
            </TotalDiv>
            {!isSSR && (
              <React.Suspense fallback={<div />}>
                <ReactDataGridLazy
                  columns={pvColumns}
                  onGridSort={onGridSort}
                  rowGetter={(i) => rows[i]}
                  rowsCount={rows.length}
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
