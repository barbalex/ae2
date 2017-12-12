// @flow
import React from 'react'
import ReactDataGrid from 'react-data-grid'
import RaisedButton from 'material-ui/RaisedButton'
import Snackbar from 'material-ui/Snackbar'
import compose from 'recompose/compose'
import withState from 'recompose/withState'
import withHandlers from 'recompose/withHandlers'
import styled from 'styled-components'
import get from 'lodash/get'
import orderBy from 'lodash/orderBy'

import exportData from '../../../modules/exportData'
import exportTaxonomiesData from '../../../modules/exportTaxonomiesData'
import exportPcoPropertiesData from '../../../modules/exportPcoPropertiesData'
import exportRcoPropertiesData from '../../../modules/exportRcoPropertiesData'
import exportTaxPropertiesData from '../../../modules/exportTaxPropertiesData'
import exportTaxFiltersData from '../../../modules/exportTaxFiltersData'
import exportPcoFiltersData from '../../../modules/exportPcoFiltersData'
import exportRcoFiltersData from '../../../modules/exportRcoFiltersData'
import exportWithSynonymDataData from '../../../modules/exportWithSynonymDataData'
import conv from '../../../modules/convertExportFieldName'
import exportXlsx from '../../../modules/exportXlsx'
import exportCsv from '../../../modules/exportCsv'

const Container = styled.div`
  .react-grid-Container {
    font-size: small;
  }
  .react-grid-Header {
  }
  .react-grid-HeaderRow {
    overflow: hidden;
  }
  .react-grid-HeaderCell:not(:first-child) {
    border-left: #c7c7c7 solid 1px !important;
  }
  .react-grid-HeaderCell__draggable {
    right: 16px !important;
  }
  .react-grid-Cell {
    border: #ddd solid 1px !important;
  }
`
const SpreadsheetContainer = styled.div`
  display: flex;
  flex-direction: column;
`
const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
`
const TotalDiv = styled.div`
  font-size: small;
  padding-left: 9px;
  margin-top: 10px;
`
const snackbarBodyStyle = {
  maxWidth: 'auto',
  minWidth: 'auto',
  backgroundColor: '#2E7D32',
}

const enhance = compose(
  exportTaxonomiesData,
  exportTaxPropertiesData,
  exportTaxFiltersData,
  exportPcoPropertiesData,
  exportPcoFiltersData,
  exportRcoPropertiesData,
  exportRcoFiltersData,
  exportWithSynonymDataData,
  exportData,
  withState('sortField', 'setSortField', 'id'),
  withState('sortDirection', 'setSortDirection', 'asc'),
  withState('message', 'setMessage', ''),
  withHandlers({
    onSetMessage: ({ message, setMessage }) => (message: String) => {
      setMessage(message)
      if (!!message) {
        setTimeout(() => setMessage(''), 5000)
      }
    },
  })
)

const Preview = ({
  exportData,
  exportTaxonomiesData,
  exportTaxPropertiesData,
  exportTaxFiltersData,
  exportPcoPropertiesData,
  exportPcoFiltersData,
  exportRcoPropertiesData,
  exportRcoFiltersData,
  exportWithSynonymDataData,
  sortField,
  sortDirection,
  setSortField,
  setSortDirection,
  message,
  onSetMessage,
}: {
  exportData: Object,
  exportTaxonomiesData: Object,
  exportTaxPropertiesData: Object,
  exportTaxFiltersData: Object,
  exportPcoPropertiesData: Object,
  exportPcoFiltersData: Object,
  exportRcoPropertiesData: Object,
  exportRcoFiltersData: Object,
  exportWithSynonymDataData: Object,
  sortField: String,
  sortDirection: String,
  setSortField: () => void,
  setSortDirection: () => void,
  message: String,
  onSetMessage: () => void,
}) => {
  const exportWithSynonymData = get(
    exportWithSynonymDataData,
    'exportWithSynonymData',
    true
  )
  const exportTaxProperties = get(
    exportTaxPropertiesData,
    'exportTaxProperties',
    []
  )
  const exportPcoProperties = get(
    exportPcoPropertiesData,
    'exportPcoProperties',
    []
  )
  const exportRcoProperties = get(
    exportRcoPropertiesData,
    'exportRcoProperties',
    []
  )
  //consoleconsole.log('Preview: exportData:', exportData)
  const { loading } = exportData
  const objects = get(exportData, 'exportObject.nodes', [])
  const pco = get(exportData, 'exportPco.nodes', [])
  const synonymPco = get(exportData, 'exportSynonymPco.nodes', [])
  const rco = get(exportData, 'exportRco.nodes', [])
  const synonymRco = get(exportData, 'exportSynonymRco.nodes', [])
  const rows = orderBy(
    objects.map(o => {
      // 1. object
      const row = {}
      row.id = o.id
      const properties = JSON.parse(o.properties)
      exportTaxProperties.forEach(
        p => (row[`${conv(p.taxname)}__${conv(p.pname)}`] = properties[p.pname])
      )
      // 2. pco
      const thisPco = pco.find(p => p.objectId === o.id)
      const thisSynonymPco = synonymPco.find(p => p.objectId === o.id)
      if (thisPco) {
        const thisPcoProperties = JSON.parse(thisPco.properties)
        exportPcoProperties.forEach(p => {
          if (thisPcoProperties[p.pname] !== undefined) {
            row[`${conv(p.pcname)}__${conv(p.pname)}`] =
              thisPcoProperties[p.pname]
          }
        })
      } else if (exportWithSynonymData && thisSynonymPco) {
        // only use of this pco does not exist on original object
        const thisSynonymPcoProperties = JSON.parse(thisSynonymPco.properties)
        exportPcoProperties.forEach(p => {
          row[`${conv(p.pcname)}__${conv(p.pname)}`] =
            thisSynonymPcoProperties[p.pname]
        })
      }
      // add every field if still missing
      exportPcoProperties.forEach(p => {
        if (row[`${conv(p.pcname)}__${conv(p.pname)}`] === undefined) {
          row[`${conv(p.pcname)}__${conv(p.pname)}`] = null
        }
      })
      // 3. rco
      const thisRco = rco.find(p => p.objectId === o.id)
      const thisSynonymRco = synonymRco.find(p => p.objectId === o.id)
      if (thisRco) {
        const thisRcoProperties = JSON.parse(thisRco.properties)
        exportRcoProperties.forEach(p => {
          if (thisRcoProperties[p.pname] !== undefined) {
            row[`${conv(p.pcname)}__${conv(p.pname)}`] =
              thisRcoProperties[p.pname]
          }
        })
      } else if (exportWithSynonymData && thisSynonymRco) {
        // only use of this rco does not exist on original object
        const thisSynonymRcoProperties = JSON.parse(thisSynonymRco.properties)
        exportRcoProperties.forEach(p => {
          row[`${conv(p.pcname)}__${conv(p.pname)}`] =
            thisSynonymRcoProperties[p.pname]
        })
      }
      // add every field if still missing
      exportRcoProperties.forEach(p => {
        if (row[`${conv(p.pcname)}__${conv(p.pname)}`] === undefined) {
          row[`${conv(p.pcname)}__${conv(p.pname)}`] = null
        }
      })
      return row
    }),
    sortField,
    sortDirection
  )
  //console.log('Preview: rows:', rows)
  const pvColumns = rows[0]
    ? Object.keys(rows[0]).map(k => ({
        key: k,
        name: k,
        resizable: true,
        sortable: true,
      }))
    : []

  return (
    <Container>
      {rows.length > 0 && (
        <SpreadsheetContainer>
          <ReactDataGrid
            onGridSort={(column, direction) => {
              setSortField(column)
              setSortDirection(direction.toLowerCase())
            }}
            columns={pvColumns}
            rowGetter={i => rows[i]}
            rowsCount={rows.length}
            minHeight={500}
            minColumnWidth={120}
          />
          <TotalDiv>{`${rows.length} Datensätze, ${
            Object.keys(rows[0]).length
          } Felder`}</TotalDiv>
        </SpreadsheetContainer>
      )}
      {rows.length > 0 && (
        <ButtonsContainer>
          <RaisedButton
            label=".xlsx herunterladen"
            onClick={() => exportXlsx({ rows, onSetMessage })}
          />
          <RaisedButton
            label=".csv herunterladen"
            onClick={() => exportCsv(rows)}
          />
        </ButtonsContainer>
      )}
      <Snackbar
        open={!!message}
        message={message}
        bodyStyle={snackbarBodyStyle}
      />
      <Snackbar
        open={loading}
        message="lade Daten..."
        bodyStyle={snackbarBodyStyle}
      />
    </Container>
  )
}

export default enhance(Preview)
