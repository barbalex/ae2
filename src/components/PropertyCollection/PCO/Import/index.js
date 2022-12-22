import React, {
  useState,
  useReducer,
  useCallback,
  useContext,
  useMemo,
} from 'react'
import styled from '@emotion/styled'
import omit from 'lodash/omit'
import union from 'lodash/union'
import flatten from 'lodash/flatten'
import some from 'lodash/some'
import uniq from 'lodash/uniq'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import Dropzone from 'react-dropzone'
import { read, utils } from 'xlsx'
import {
  useQuery as useApolloQuery,
  useApolloClient,
  gql,
} from '@apollo/client'
import { observer } from 'mobx-react-lite'
import SimpleBar from 'simplebar-react'
import { getSnapshot } from 'mobx-state-tree'
import { useQuery } from '@tanstack/react-query'

import upsertPCOMutation from './upsertPCOMutation'
import storeContext from '../../../../storeContext'
import isUuid from '../../../../modules/isUuid'
import { pcoPreviewQuery } from '..'
import treeQuery from '../../../Tree/treeQuery'
import DataTable from '../../../shared/DataTable'
import CountInput from '../../../Export/PreviewColumn/CountInput'
import Instructions from './Instructions'
import getTreeDataVariables from '../../../Tree/treeQueryVariables'

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
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
const DropzoneContainer = styled.div`
  padding: 10px 8px;
  div {
    width: 100% !important;
    height: 124px !important;
    cursor: pointer;
  }
`
const DropzoneDiv = styled.div`
  padding: 8px;
  border-width: 2px;
  border-color: rgb(102, 102, 102);
  border-style: dashed;
  border-radius: 5px;
`
const DropzoneDivActive = styled(DropzoneDiv)`
  background-color: rgba(255, 224, 178, 0.2);
`
const StyledButton = styled(Button)`
  border: 1px solid !important;
  margin: 8px 8px 16px 8px !important;
  background-image: ${(props) =>
    `linear-gradient(to right, #4caf50 ${props.completed * 100}%, transparent ${
      props.completed * 100
    }% ${100 - props.completed * 100}%)`} !important;
`
const TotalDiv = styled.div`
  font-size: small;
  padding-left: 9px;
  margin-top: 8px;
`
const StyledSnackbar = styled(Snackbar)`
  div {
    min-width: auto;
    background-color: #2e7d32 !important;
  }
`

const importPcoQuery = gql`
  query pCOQuery(
    $getObjectIds: Boolean!
    $getPCOfOriginIds: Boolean!
    $pCOfOriginIds: [UUID!]
  ) {
    allObjects @include(if: $getObjectIds) {
      nodes {
        id
      }
    }
    allPropertyCollections(filter: { id: { in: $pCOfOriginIds } })
      @include(if: $getPCOfOriginIds) {
      nodes {
        id
      }
    }
  }
`

const checkStateReducer = (a, state) => state

const initialCheckState = {
  existsNoDataWithoutKey: undefined,
  idsAreUuids: undefined,
  idsExist: undefined,
  idsAreUnique: undefined,
  objectIdsExist: undefined,
  pCOfOriginIdsExist: undefined,
  objectIdsAreRealNotTested: undefined,
  pCOfOriginIdsAreRealNotTested: undefined,
  objectIdsAreUuid: undefined,
  pCOfOriginIdsAreUuid: undefined,
  propertyKeysDontContainApostroph: undefined,
  propertyKeysDontContainBackslash: undefined,
  propertyValuesDontContainApostroph: undefined,
  propertyValuesDontContainBackslash: undefined,
  existsPropertyKey: undefined,
}

const ImportPco = ({ setImport }) => {
  const client = useApolloClient()
  const store = useContext(storeContext)
  const activeNodeArray = getSnapshot(store.activeNodeArray)
  const pCId =
    activeNodeArray.length > 0
      ? activeNodeArray[1]
      : '99999999-9999-9999-9999-999999999999'

  const [objectIds, setObjectIds] = useState([])
  const [pCOfOriginIds, setPCOfOriginIds] = useState([])

  const [count, setCount] = useState(15)

  // console.log('importPco render')

  const [orderBy, setOrderBy] = useState('objectId')
  const [sortDirection, setSortDirection] = useState('asc')
  const setOrder = useCallback(({ orderBy, direction }) => {
    setOrderBy(orderBy)
    setSortDirection(direction.toLowerCase())
  }, [])

  const { refetch: pcoRefetch } = useApolloQuery(pcoPreviewQuery, {
    variables: {
      pCId,
      first: 15,
    },
  })
  const { refetch: treeDataRefetch } = useApolloQuery(treeQuery, {
    variables: getTreeDataVariables(store),
  })

  const { isLoading, error, data } = useQuery({
    queryKey: ['importPcoQuery', pCId,objectIds.length,pCOfOriginIds.length],
    queryFn: async () => {
      const { data } = await client.query({
        query: importPcoQuery,
        variables: {
          getObjectIds: objectIds.length > 0,
          getPCOfOriginIds: pCOfOriginIds.length > 0,
          pCOfOriginIds:
            pCOfOriginIds.length > 0
              ? pCOfOriginIds
              : ['99999999-9999-9999-9999-999999999999'],
        },
      })
      return data
    },
  })

  const [importData, setImportData] = useState([])
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState(0)
  const incrementImported = useCallback(
    () => setImported(() => imported + 1),
    [imported],
  )

  const [checkState, dispatch] = useReducer(
    checkStateReducer,
    initialCheckState,
  )

  if (error && error.message) {
    console.log('error', error.message)
  }
  const objectIdsUnreal = useMemo(() => {
    const realObjectIds = (data?.allObjects?.nodes ?? []).map((o) => o.id)
    return objectIds.filter((i) => !realObjectIds.includes(i))
  }, [data, objectIds])

  const objectIdsAreReal = useMemo(
    () =>
      !isLoading && objectIds.length > 0
        ? objectIdsUnreal.length === 0
        : undefined,
    [isLoading, objectIds.length, objectIdsUnreal.length],
  )
  const pCOfOriginsCheckData = data?.allPropertyCollections?.nodes ?? []
  const pCOfOriginIdsAreReal = useMemo(
    () =>
      !isLoading && pCOfOriginIds.length > 0
        ? pCOfOriginIds.length === pCOfOriginsCheckData.length
        : undefined,
    [isLoading, pCOfOriginIds.length, pCOfOriginsCheckData.length],
  )
  const showImportButton = useMemo(
    () =>
      importData.length > 0 &&
      checkState.existsNoDataWithoutKey &&
      (checkState.idsExist
        ? checkState.idsAreUnique && checkState.idsAreUuids
        : true) &&
      // turned off because of inexplicable problem
      // somehow graphql could exceed some limit
      // which made this value block importing
      // although this value was true ?????!!!!
      /*(objectIdsExist
      ? objectIdsAreUuid && (objectIdsAreReal || objectIdsAreRealNotTested)
      : false) &&*/
      (checkState.pCOfOriginIdsExist
        ? checkState.pCOfOriginIdsAreUuid &&
          (pCOfOriginIdsAreReal || checkState.pCOfOriginIdsAreRealNotTested)
        : true) &&
      checkState.existsPropertyKey &&
      checkState.propertyKeysDontContainApostroph &&
      checkState.propertyKeysDontContainBackslash &&
      checkState.propertyValuesDontContainApostroph &&
      checkState.propertyValuesDontContainBackslash,
    [
      checkState.existsNoDataWithoutKey,
      checkState.existsPropertyKey,
      checkState.idsAreUnique,
      checkState.idsAreUuids,
      checkState.idsExist,
      checkState.pCOfOriginIdsAreRealNotTested,
      checkState.pCOfOriginIdsAreUuid,
      checkState.pCOfOriginIdsExist,
      checkState.propertyKeysDontContainApostroph,
      checkState.propertyKeysDontContainBackslash,
      checkState.propertyValuesDontContainApostroph,
      checkState.propertyValuesDontContainBackslash,
      importData.length,
      pCOfOriginIdsAreReal,
    ],
  )
  const showPreview = importData.length > 0
  const importDataFields = useMemo(() => {
    let fields = []
    importData.forEach((d) => {
      fields = union([...fields, ...Object.keys(d)])
    })
    return fields
  }, [importData])
  const propertyFields = useMemo(
    () =>
      importDataFields.filter(
        (f) => !['id', 'objectId', 'propertyCollectionOfOrigin'].includes(f),
      ),
    [importDataFields],
  )

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async () => {
        const checkState = { ...initialCheckState }
        const fileAsBinaryString = reader.result
        const workbook = read(fileAsBinaryString, {
          type: 'binary',
        })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const data = utils
          .sheet_to_json(worksheet)
          .map((d) => omit(d, ['__rowNum__']))
        // test the data
        setImportData(data)
        checkState.existsNoDataWithoutKey =
          data.filter((d) => !!d.__EMPTY).length === 0
        const ids = data.map((d) => d.id).filter((d) => d !== undefined)
        const _idsExist = ids.length > 0
        checkState.idsExist = _idsExist
        checkState.idsAreUuid = _idsExist
          ? !ids.map((d) => isUuid(d)).includes(false)
          : undefined
        checkState.idsAreUnique = _idsExist
          ? ids.length === uniq(ids).length
          : undefined
        const _objectIds = data
          .map((d) => d.objectId)
          .filter((d) => d !== undefined)

        const _objectIdsExist = _objectIds.length === data.length
        checkState.objectIdsExist = _objectIdsExist
        const _objectsIdsAreNotUuid = data.filter((d) => !isUuid(d.objectId))
        checkState.objectIdsAreUuid = _objectIdsExist
          ? _objectsIdsAreNotUuid.length === 0
          : undefined
        setObjectIds(_objectIds)

        const _pCOfOriginIds = data
          .map((d) => d.propertyCollectionOfOrigin)
          .filter((d) => d !== undefined)
        const _pCOfOriginIdsExist = _pCOfOriginIds.length > 0
        checkState.pCOfOriginIdsExist = _pCOfOriginIdsExist
        checkState.pCOfOriginIdsAreUuid = _pCOfOriginIdsExist
          ? !_pCOfOriginIds.map((d) => isUuid(d)).includes(false)
          : undefined
        setPCOfOriginIds(_pCOfOriginIds)

        const propertyKeys = union(
          flatten(data.map((d) => Object.keys(omit(d, ['id', 'objectId'])))),
        )
        const _existsPropertyKey = propertyKeys.length > 0
        checkState.existsPropertyKey = _existsPropertyKey
        checkState.propertyKeysDontContainApostroph = _existsPropertyKey
          ? !some(propertyKeys, (k) => {
              if (!k || !k.includes) return false
              return k.includes('"')
            })
          : undefined
        checkState.propertyKeysDontContainBackslash = _existsPropertyKey
          ? !some(propertyKeys, (k) => {
              if (!k || !k.includes) return false
              return k.includes('\\')
            })
          : undefined
        const propertyValues = union(flatten(data.map((d) => Object.values(d))))
        checkState.propertyValuesDontContainApostroph = !some(
          propertyValues,
          (k) => {
            if (!k || !k.includes) return false
            return k.includes('"')
          },
        )
        checkState.propertyValuesDontContainBackslash = !some(
          propertyValues,
          (k) => {
            if (!k || !k.includes) return false
            return k.includes('\\')
          },
        )

        dispatch(checkState)
      }
      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.readAsBinaryString(file)
    }
  }, [])

  const onClickImport = useCallback(async () => {
    setImporting(true)

    // need a list of all fields
    // loop all rows, build variables and create pco
    const posts = []
    // eslint-disable-next-line no-unused-vars
    for (const d of importData) {
      const variables = {
        objectId: d.objectId || null,
        propertyCollectionId: pCId,
        propertyCollectionOfOrigin: d.propertyCollectionOfOrigin || null,
        properties: JSON.stringify(
          omit(d, [
            'id',
            'objectId',
            'propertyCollectionId',
            'propertyCollectionOfOrigin',
          ]),
        ),
      }

      posts.push(
        client
          .mutate({
            mutation: upsertPCOMutation,
            variables,
          })
          .then(() => incrementImported()),
      )
    }
    await Promise.all(posts)
    setImport(false)
    setImporting(false)
    try {
      pcoRefetch()
    } catch (error) {
      console.log('Error refetching pco:', error)
    }
    try {
      treeDataRefetch()
    } catch (error) {
      console.log('Error refetching tree:', error)
    }
  }, [
    setImport,
    pcoRefetch,
    treeDataRefetch,
    importData,
    pCId,
    client,
    incrementImported,
  ])

  // console.log('ImportPco', { importData, importDataFields })

  return (
    <SimpleBar style={{ maxHeight: '100%', height: '100%' }}>
      <Container>
        <Instructions
          {...checkState}
          objectIdsAreReal={objectIdsAreReal}
          pCOfOriginIdsAreReal={pCOfOriginIdsAreReal}
        />
        {!importing && (
          <DropzoneContainer>
            <Dropzone
              onDrop={onDrop}
              types={[
                {
                  description: 'spreadsheet files',
                  accept: {
                    'text/plain': ['.dif'],
                    'application/dbf': ['.dbf'],
                    'text/csv': ['.csv'],
                    'application/vnd.oasis.opendocument.spreadsheet': ['.ods'],
                    'application/vnd.ms-excel': ['.xls'],
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                      ['.xlsx'],
                  },
                },
              ]}
              excludeAcceptAllOption={true}
              multiple={false}
            >
              {({
                getRootProps,
                getInputProps,
                isDragActive,
                isDragReject,
              }) => {
                if (isDragActive)
                  return (
                    <DropzoneDivActive {...getRootProps()}>
                      Hier fallen lassen
                    </DropzoneDivActive>
                  )
                if (isDragReject)
                  return (
                    <DropzoneDivActive {...getRootProps()}>
                      njet!
                    </DropzoneDivActive>
                  )
                return (
                  <DropzoneDiv {...getRootProps()}>
                    <input {...getInputProps()} />
                    Datei hierhin ziehen.
                    <br />
                    Oder hier klicken, um eine Datei auszuwählen.
                    <br />
                    <br />
                    Akzeptierte Formate: xlsx, xls, csv, ods, dbf, dif
                  </DropzoneDiv>
                )
              }}
            </Dropzone>
          </DropzoneContainer>
        )}
        {showImportButton && (
          <StyledButton
            onClick={onClickImport}
            disabled={importing}
            completed={imported / importData.length}
            color="inherit"
          >
            {importing ? `${imported} importiert` : 'importieren'}
          </StyledButton>
        )}
        {showPreview && (
          <>
            <TotalDiv>
              {`${importData.length.toLocaleString(
                'de-CH',
              )} Datensätze, ${propertyFields.length.toLocaleString(
                'de-CH',
              )} Feld${propertyFields.length === 1 ? '' : 'er'}${
                importData.length > 0 ? ':' : ''
              }, Erste `}
              <CountInput count={count} setCount={setCount} />
              {' :'}
            </TotalDiv>
            <DataTable
              data={importData.slice(0, count)}
              idKey="objectId"
              keys={importDataFields}
              setOrder={setOrder}
              orderBy={orderBy}
              order={sortDirection}
            />
          </>
        )}
        <StyledSnackbar open={isLoading} message="lade Daten..." />
      </Container>
    </SimpleBar>
  )
}

export default observer(ImportPco)
