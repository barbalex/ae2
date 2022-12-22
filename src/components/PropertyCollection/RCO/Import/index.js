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
import isUuid from 'is-uuid'
import {
  useQuery as useApolloQuery,
  useApolloClient,
  gql,
} from '@apollo/client'
import { observer } from 'mobx-react-lite'
import SimpleBar from 'simplebar-react'
import { getSnapshot } from 'mobx-state-tree'
import { useQuery } from '@tanstack/react-query'

import createRCOMutation from './createRCOMutation'
import updateRCOMutation from './updateRCOMutation'
import storeContext from '../../../../storeContext'
import { rcoQuery, rcoPreviewQuery } from '..'
import treeQuery from '../../../Tree/treeQuery'
import DataTable from '../../../shared/DataTable'
import CountInput from '../../../Export/PreviewColumn/CountInput'
import getTreeDataVariables from '../../../Tree/treeQueryVariables'
import Instructions from './Instructions'

// react-data-grid calls window!
const ReactDataGridLazy = React.lazy(() => import('react-data-grid'))

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

const importRcoQuery = gql`
  query rCOQuery(
    $getObjectIds: Boolean!
    $getObjectRelationIds: Boolean!
    $objectRelationIds: [UUID!]
    $getPCOfOriginIds: Boolean!
    $pCOfOriginIds: [UUID!]
  ) {
    allObjects @include(if: $getObjectIds) {
      nodes {
        id
      }
    }
    allObjectRelations: allObjects(filter: { id: { in: $objectRelationIds } })
      @include(if: $getObjectRelationIds) {
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
  idsExist: undefined,
  idsAreUuids: undefined,
  idsAreUnique: undefined,
  objectIdsExist: undefined,
  objectIdsAreUuid: undefined,
  objectIdsAreRealNotTested: undefined,
  objectRelationIdsExist: undefined,
  objectRelationIdsAreUuid: undefined,
  objectRelationIdsAreRealNotTested: undefined,
  relationTypeExist: undefined,
  pCOfOriginIdsExist: undefined,
  pCOfOriginIdsAreUuid: undefined,
  pCOfOriginIdsAreReal: undefined,
  pCOfOriginIdsAreRealNotTested: undefined,
  propertyKeysDontContainApostroph: undefined,
  propertyKeysDontContainBackslash: undefined,
  propertyValuesDontContainApostroph: undefined,
  propertyValuesDontContainBackslash: undefined,
}

const ImportRco = ({ setImport }) => {
  const isSSR = typeof window === 'undefined'
  const client = useApolloClient()
  const store = useContext(storeContext)
  const activeNodeArray = getSnapshot(store.activeNodeArray)
  const pCId =
    activeNodeArray.length > 0
      ? activeNodeArray[1]
      : '99999999-9999-9999-9999-999999999999'

  const [objectIds, setObjectIds] = useState([])
  const [objectRelationIds, setObjectRelationIds] = useState([])
  const [pCOfOriginIds, setPCOfOriginIds] = useState([])
  const [imported, setImported] = useState(0)

  const { refetch: rcoRefetch } = useApolloQuery(rcoPreviewQuery, {
    variables: {
      pCId,
      first: 15,
    },
  })
  const { refetch: treeDataRefetch } = useApolloQuery(treeQuery, {
    variables: getTreeDataVariables(store),
  })

  const {
    data: importRcoData,
    loading: importRcoLoading,
    error: importRcoError,
  } = useApolloQuery(importRcoQuery, {
    variables: {
      getObjectIds: objectIds.length > 0,
      getObjectRelationIds: objectRelationIds.length > 0,
      objectRelationIds:
        objectRelationIds.length > 0
          ? objectRelationIds
          : ['99999999-9999-9999-9999-999999999999'],
      getPCOfOriginIds: pCOfOriginIds.length > 0,
      pCOfOriginIds:
        pCOfOriginIds.length > 0
          ? pCOfOriginIds
          : ['99999999-9999-9999-9999-999999999999'],
    },
  })

  const [importData, setImportData] = useState([])
  const [importing, setImporting] = useState(false)

  const [checkState, dispatch] = useReducer(
    checkStateReducer,
    initialCheckState,
  )

  if (importRcoError && importRcoError.message) {
    console.log('importRcoError', importRcoError.message)
  }

  const objectIdsUnreal = useMemo(() => {
    const realIds = (importRcoData?.allObjects?.nodes ?? []).map((o) => o.id)
    return objectIds.filter((i) => !realIds.includes(i))
  }, [importRcoData, objectIds])
  const objectIdsAreReal = useMemo(
    () =>
      !importRcoLoading && objectIds.length > 0
        ? objectIdsUnreal.length === 0
        : undefined,
    [importRcoLoading, objectIds.length, objectIdsUnreal.length],
  )
  const objectRelationIdsUnreal = useMemo(() => {
    const realIds = (importRcoData?.allObjectRelations?.nodes ?? []).map(
      (o) => o.id,
    )
    return objectIds.filter((i) => !realIds.includes(i))
  }, [importRcoData, objectIds])
  const objectRelationIdsAreReal = useMemo(
    () =>
      !importRcoLoading && objectRelationIds.length > 0
        ? objectRelationIdsUnreal.length === 0
        : undefined,
    [
      importRcoLoading,
      objectRelationIds.length,
      objectRelationIdsUnreal.length,
    ],
  )
  const pCOfOriginIdsUnreal = useMemo(() => {
    const realIds = (importRcoData?.allPropertyCollections?.nodes ?? []).map(
      (o) => o.id,
    )
    return pCOfOriginIds.filter((i) => !realIds.includes(i))
  }, [importRcoData, pCOfOriginIds])
  const pCOfOriginIdsAreReal = useMemo(
    () =>
      !importRcoLoading && pCOfOriginIds.length > 0
        ? pCOfOriginIdsUnreal.length === 0
        : undefined,
    [importRcoLoading, pCOfOriginIds.length, pCOfOriginIdsUnreal.length],
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
      (checkState.objectRelationIdsExist
        ? checkState.objectRelationIdsAreUuid &&
          (objectRelationIdsAreReal ||
            checkState.objectRelationIdsAreRealNotTested)
        : false) &&
      checkState.relationTypeExist &&
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
      checkState.objectRelationIdsAreRealNotTested,
      checkState.objectRelationIdsAreUuid,
      checkState.objectRelationIdsExist,
      checkState.pCOfOriginIdsAreRealNotTested,
      checkState.pCOfOriginIdsAreUuid,
      checkState.pCOfOriginIdsExist,
      checkState.propertyKeysDontContainApostroph,
      checkState.propertyKeysDontContainBackslash,
      checkState.propertyValuesDontContainApostroph,
      checkState.propertyValuesDontContainBackslash,
      checkState.relationTypeExist,
      importData.length,
      objectRelationIdsAreReal,
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

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = () => {
          const fileAsBinaryString = reader.result
          const workbook = read(fileAsBinaryString, {
              type: 'binary',
            }),
            sheetName = workbook.SheetNames[0],
            worksheet = workbook.Sheets[sheetName]
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
            ? !ids.map((d) => isUuid.anyNonNil(d)).includes(false)
            : undefined
          checkState.idsAreUnique = _idsExist
            ? ids.length === uniq(ids).length
            : undefined
          const _objectIds = data
            .map((d) => d.objectId)
            .filter((d) => d !== undefined)
          const _objectIdsExist = _objectIds.length === data.length
          checkState.objectIdsExist = _objectIdsExist
          checkState.objectIdsAreUuid = _objectIdsExist
            ? !_objectIds.map((d) => isUuid.anyNonNil(d)).includes(false)
            : undefined
          setObjectIds(_objectIds)

          const _objectRelationIds = data
            .map((d) => d.objectIdRelation)
            .filter((d) => d !== undefined)
          const _objectRelationIdsExist =
            _objectRelationIds.length === data.length
          checkState.objectRelationIdsExist = _objectRelationIdsExist
          checkState.objectRelationIdsAreUuid = _objectRelationIdsExist
            ? !_objectRelationIds
                .map((d) => isUuid.anyNonNil(d))
                .includes(false)
            : undefined
          setObjectRelationIds(_objectRelationIds)

          const _relationTypes = data
            .map((d) => d.relationType)
            .filter((d) => d !== undefined)
          const _relationTypesExist = _relationTypes.length === data.length
          checkState.relationTypeExist = _relationTypesExist

          const _pCOfOriginIds = data
            .map((d) => d.propertyCollectionOfOrigin)
            .filter((d) => d !== undefined)
          const _pCOfOriginIdsExist = _pCOfOriginIds.length > 0
          checkState.pCOfOriginIdsExist = _pCOfOriginIdsExist
          checkState.pCOfOriginIdsAreUuid = _pCOfOriginIdsExist
            ? !_pCOfOriginIds.map((d) => isUuid.anyNonNil(d)).includes(false)
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
          const propertyValues = union(
            flatten(data.map((d) => Object.values(d))),
          )
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
    },
    [checkState],
  )

  const onClickImport = useCallback(async () => {
    setImporting(true)
    const { data } = await client.query({
      query: rcoQuery,
      variables: {
        pCId,
      },
    })
    const pCO = (
      data?.propertyCollectionById?.relationsByPropertyCollectionId?.nodes ?? []
    ).map((p) => omit(p, ['__typename']))
    // need a list of all fields
    // loop all rows, build variables and create pco
    // eslint-disable-next-line no-unused-vars
    for (const [i, d] of importData.entries()) {
      const pco = pCO.find((o) => o.objectId === d.objectId)
      const id = pco && pco.id ? pco.id : undefined
      const variables = {
        objectId: d.objectId || null,
        objectIdRelation: d.objectIdRelation || null,
        propertyCollectionId: pCId,
        propertyCollectionOfOrigin: d.propertyCollectionOfOrigin || null,
        relationType: d.relationType || null,
        properties: JSON.stringify(
          omit(d, [
            'id',
            'objectId',
            'objectIdRelation',
            'propertyCollectionId',
            'propertyCollectionOfOrigin',
            'relationType',
          ]),
        ),
      }
      if (id) {
        try {
          await client.mutate({
            mutation: updateRCOMutation,
            variables: { id, ...variables },
          })
        } catch (error) {
          console.log(error)
        }
      } else {
        try {
          await client.mutate({
            mutation: createRCOMutation,
            variables,
          })
        } catch (error) {
          console.log(error)
        }
      }
      setImported(i)
    }
    setImport(false)
    setImporting(false)
    try {
      rcoRefetch()
    } catch (error) {
      console.log('Error refetching rco:', error)
    }
    try {
      treeDataRefetch()
    } catch (error) {
      console.log('Error refetching tree:', error)
    }
  }, [client, importData, pCId, rcoRefetch, setImport])
  const rowGetter = useCallback((i) => importData[i], [importData])

  return (
    <SimpleBar style={{ maxHeight: '100%', height: '100%' }}>
      <Container>
        <Instructions
          objectIdsAreReal={objectIdsAreReal}
          objectRelationIdsAreReal={objectRelationIdsAreReal}
          {...checkState}
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
            completed={imported / importData.length}
            disabled={importing}
            color="inherit"
          >
            {importing ? `${imported} importiert` : 'importieren'}
          </StyledButton>
        )}
        {showPreview && (
          <>
            <TotalDiv>{`${importData.length.toLocaleString(
              'de-CH',
            )} Datensätze, ${propertyFields.length.toLocaleString(
              'de-CH',
            )} Feld${propertyFields.length === 1 ? '' : 'er'}${
              importData.length > 0 ? ':' : ''
            }`}</TotalDiv>
            {!isSSR && (
              <React.Suspense fallback={<div />}>
                <ReactDataGridLazy
                  columns={importDataFields.map((k) => ({
                    key: k,
                    name: k,
                    resizable: true,
                  }))}
                  rowGetter={rowGetter}
                  rowsCount={importData.length}
                />
              </React.Suspense>
            )}
          </>
        )}
        <StyledSnackbar open={importRcoLoading} message="lade Daten..." />
      </Container>
    </SimpleBar>
  )
}

export default observer(ImportRco)
