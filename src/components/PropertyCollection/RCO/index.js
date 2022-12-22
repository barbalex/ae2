import React, { useState, useCallback, useContext, useMemo } from 'react'
import styled from '@emotion/styled'
import omit from 'lodash/omit'
import forOwn from 'lodash/forOwn'
import union from 'lodash/union'
import doOrderBy from 'lodash/orderBy'
import Button from '@mui/material/Button'
import { useQuery, useApolloClient, gql } from '@apollo/client'
import { observer } from 'mobx-react-lite'
import { getSnapshot } from 'mobx-state-tree'

import ImportRco from './Import'
import booleanToJaNein from '../../../modules/booleanToJaNein'
import exportXlsx from '../../../modules/exportXlsx'
import exportCsv from '../../../modules/exportCsv'
import deleteRcoOfPcMutation from './deleteRcoOfPcMutation'
import treeQuery from '../../Tree/treeQuery'
import treeQueryVariables from '../../Tree/treeQueryVariables'
import storeContext from '../../../storeContext'
import Spinner from '../../shared/Spinner'
import DataTable from '../../shared/DataTable'
import CountInput from '../../Export/PreviewColumn/CountInput'
import exists from '../../../modules/exists'

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .react-grid-Container {
    font-size: small;
  }
  .react-grid-HeaderCell:not(:first-of-type) {
    border-left: #c7c7c7 solid 1px !important;
  }
  .react-grid-Cell {
    border: #ddd solid 1px !important;
  }
  .react-grid-Canvas {
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px !important;
    }
    ::-webkit-scrollbar-thumb {
      border-radius: 3px;
      box-shadow: inset 0 0 7px #e65100;
    }
    ::-webkit-scrollbar-track {
      border-radius: 1rem;
      box-shadow: none;
    }
  }
`
const TotalDiv = styled.div`
  font-size: small;
  padding-left: 9px;
  margin-top: 8px;
  user-select: none;
`
const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
`
const ExportButtons = styled.div`
  display: flex;
  justify-content: space-between;
`
const MutationButtons = styled.div`
  display: flex;
  justify-content: space-between;
`
const StyledButton = styled(Button)`
  margin: 5px !important;
  ${(props) => props.loading && `font-style: italic;`}
  ${(props) => props.loading && `animation: blinker 1s linear infinite;`}
  ${(props) => props.loading && `animation: blinker 1s linear infinite;`}
  @keyframes blinker {
    50% {
      opacity: 0;
    }
  }
`

const rcoQuery = gql`
  query rCOQuery($pCId: UUID!) {
    propertyCollectionById(id: $pCId) {
      id
      vRelationCollectionKeysByPropertyCollectionId(
        filter: { propertyCollectionId: { equalTo: $pCId } }
      ) {
        nodes {
          keys
        }
      }
      organizationByOrganizationId {
        id
        name
        organizationUsersByOrganizationId {
          nodes {
            id
            userId
            role
            userByUserId {
              id
              name
            }
          }
        }
      }
      relationsByPropertyCollectionId {
        totalCount
        nodes {
          id
          objectId
          objectByObjectId {
            id
            name
          }
          objectIdRelation
          objectByObjectIdRelation {
            id
            name
          }
          relationType
          properties
        }
      }
    }
  }
`
const rcoPreviewQuery = gql`
  query rcoPreviewQuery($pCId: UUID!, $count: Int!) {
    propertyCollectionById(id: $pCId) {
      id
      vRelationCollectionKeysByPropertyCollectionId(
        filter: { propertyCollectionId: { equalTo: $pCId } }
      ) {
        nodes {
          keys
        }
      }
      organizationByOrganizationId {
        id
        name
        organizationUsersByOrganizationId {
          nodes {
            id
            userId
            role
            userByUserId {
              id
              name
            }
          }
        }
      }
      relationsByPropertyCollectionId(first: $count) {
        totalCount
        nodes {
          id
          objectId
          objectByObjectId {
            id
            name
          }
          objectIdRelation
          objectByObjectIdRelation {
            id
            name
          }
          relationType
          properties
        }
      }
    }
  }
`

const RCO = () => {
  const client = useApolloClient()
  const store = useContext(storeContext)
  const { login } = store
  const activeNodeArray = getSnapshot(store.activeNodeArray)
  const pCId =
    activeNodeArray.length > 0
      ? activeNodeArray[1]
      : '99999999-9999-9999-9999-999999999999'

  const [count, setCount] = useState(15)

  const { refetch: treeDataRefetch } = useQuery(treeQuery, {
    variables: treeQueryVariables(store),
  })
  const {
    data: rcoData,
    loading: rcoLoading,
    error: rcoError,
    refetch: rcoRefetch,
  } = useQuery(rcoPreviewQuery, {
    variables: {
      pCId,
      count,
    },
  })

  const [orderBy, setOrderBy] = useState('Objekt Name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [importing, setImport] = useState(false)

  const [xlsxExportLoading, setXlsxExportLoading] = useState(false)
  const [csvExportLoading, setCsvExportLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const propKeys = (
    rcoData?.propertyCollectionById
      ?.vRelationCollectionKeysByPropertyCollectionId?.nodes ?? []
  ).map((k) => k?.keys)

  const rCO = useMemo(() => {
    const rCOUnsorted = (
      rcoData?.propertyCollectionById?.relationsByPropertyCollectionId?.nodes ??
      []
    ).map((p) => {
      let nP = {}
      nP['Objekt ID'] = p.objectId
      nP['Objekt Name'] = p?.objectByObjectId?.name ?? null
      nP['Beziehung ID'] = p.objectIdRelation
      nP['Beziehung Name'] = p?.objectByObjectIdRelation?.name ?? null
      nP['Art der Beziehung'] = p.relationType
      if (p.properties) {
        const props = JSON.parse(p.properties)
        forOwn(props, (value, key) => {
          if (typeof value === 'boolean') {
            nP[key] = booleanToJaNein(value)
          } else {
            nP[key] = value
          }
        })
      }
      // add keys that may be missing
      for (const key of propKeys) {
        if (!exists(nP[key])) {
          nP[key] = null
        }
      }
      return nP
    })
    return doOrderBy(rCOUnsorted, orderBy, sortDirection)
  }, [
    propKeys,
    rcoData?.propertyCollectionById?.relationsByPropertyCollectionId?.nodes,
    sortDirection,
    orderBy,
  ])
  // collect all keys and sort property keys by name
  const keys = [
    'Objekt ID',
    'Objekt Name',
    'Beziehung ID',
    'Beziehung Name',
    'Art der Beziehung',
    ...propKeys.sort(),
  ]
  const rCOWriters = (
    rcoData?.propertyCollectionById?.organizationByOrganizationId
      ?.organizationUsersByOrganizationId?.nodes ?? []
  ).filter((u) => ['orgAdmin', 'orgCollectionWriter'].includes(u.role))
  const writerNames = union(rCOWriters.map((w) => w.userByUserId.name))
  const { username } = login
  const userIsWriter = !!username && writerNames.includes(username)
  const showImportRco = (rCO.length === 0 && userIsWriter) || importing

  const totalCount =
    rcoData?.propertyCollectionById?.relationsByPropertyCollectionId?.totalCount

  // TODO: enable sorting
  const onGridSort = useCallback((column, direction) => {
    setOrderBy(column)
    setSortDirection(direction.toLowerCase())
  }, [])

  // TODO: key in data table should bu unique, thus: objectId + objectIdRelation
  const fetchAllData = useCallback(async () => {
    const { data, loading, error } = await client.query({
      query: rcoQuery,
      variables: {
        pCId,
      },
    })
    const rCORaw = (
      data?.propertyCollectionById?.relationsByPropertyCollectionId?.nodes ?? []
    ).map((p) => {
      let nP = {}
      nP['Objekt ID'] = p.objectId
      nP['Objekt Name'] = p?.objectByObjectId?.name ?? null
      nP['Beziehung ID'] = p.objectIdRelation
      nP['Beziehung Name'] = p?.objectByObjectIdRelation?.name ?? null
      nP['Art der Beziehung'] = p.relationType
      if (p.properties) {
        const props = JSON.parse(p.properties)
        forOwn(props, (value, key) => {
          if (typeof value === 'boolean') {
            nP[key] = booleanToJaNein(value)
          } else {
            nP[key] = value
          }
        })
      }
      // add keys that may be missing
      for (const key of propKeys) {
        if (!exists(nP[key])) {
          nP[key] = null
        }
      }
      return nP
    })
    return { data: doOrderBy(rCORaw, orderBy, sortDirection), loading, error }
  }, [client, pCId, propKeys, sortDirection, orderBy])

  const onClickXlsx = useCallback(async () => {
    setXlsxExportLoading(true)
    const { data, error } = await fetchAllData()
    exportXlsx({
      rows: data,
      onSetMessage: console.log,
    })
    setXlsxExportLoading(false)
  }, [fetchAllData])
  const onClickCsv = useCallback(async () => {
    // TODO: download all data
    setCsvExportLoading(true)
    const { data, error } = await fetchAllData()
    exportCsv(data)
    setCsvExportLoading(false)
  }, [fetchAllData])

  const onClickDelete = useCallback(async () => {
    await client.mutate({
      mutation: deleteRcoOfPcMutation,
      variables: { pcId: pCId },
    })
    rcoRefetch()
    treeDataRefetch()
  }, [client, pCId, rcoRefetch, treeDataRefetch])
  const onClickImport = useCallback(() => {
    setImport(true)
  }, [])

  if (rcoLoading) {
    return <Spinner />
  }
  if (rcoError) {
    return <Container>{`Error fetching data: ${rcoError.message}`}</Container>
  }

  return (
    <Container>
      {!showImportRco && (
        <TotalDiv>
          {`${totalCount.toLocaleString(
            'de-CH',
          )} Datensätze, ${propKeys.length.toLocaleString('de-CH')} Feld${
            propKeys.length === 1 ? '' : 'er'
          }${rCO.length > 0 ? ':' : ''}, Erste `}
          <CountInput count={count} setCount={setCount} />
          {' :'}
        </TotalDiv>
      )}
      {!importing && rCO.length > 0 && (
        <>
          <DataTable
            data={rCO}
            idKey="Objekt ID"
            keys={keys}
            uniqueKeyCombo={['Objekt ID', 'Beziehung ID']}
          />
          <ButtonsContainer>
            <ExportButtons>
              <StyledButton
                onClick={onClickXlsx}
                variant="outlined"
                color="inherit"
                loading={xlsxExportLoading}
              >
                xlsx exportieren
              </StyledButton>
              <StyledButton
                onClick={onClickCsv}
                variant="outlined"
                color="inherit"
                loading={csvExportLoading}
              >
                csv exportieren
              </StyledButton>
            </ExportButtons>
            {userIsWriter && (
              <MutationButtons>
                <StyledButton
                  onClick={onClickImport}
                  variant="outlined"
                  color="inherit"
                  loading={importLoading}
                >
                  importieren
                </StyledButton>
                <StyledButton
                  onClick={onClickDelete}
                  variant="outlined"
                  color="inherit"
                  loading={deleteLoading}
                >
                  Daten löschen
                </StyledButton>
              </MutationButtons>
            )}
          </ButtonsContainer>
        </>
      )}
      {showImportRco && <ImportRco setImport={setImport} />}
    </Container>
  )
}

export default observer(RCO)
