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

import ImportPco from './Import'
import booleanToJaNein from '../../../modules/booleanToJaNein'
import exportXlsx from '../../../modules/exportXlsx'
import exportCsv from '../../../modules/exportCsv'
import treeQuery from '../../Tree/treeQuery'
import treeQueryVariables from '../../Tree/treeQueryVariables'
import deletePcoOfPcMutation from './deletePcoOfPcMutation'
import storeContext from '../../../storeContext'
import Spinner from '../../shared/Spinner'
import DataTable from '../../shared/DataTable'
import exists from '../../../modules/exists'
import CountInput from '../../Export/PreviewColumn/CountInput'

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
export const StyledProgressText = styled.span`
  margin-left: 10px;
  font-style: italic;
  animation: blinker 1s linear infinite;
  white-space: nowrap;
  @keyframes blinker {
    50% {
      opacity: 0;
    }
  }
`

const pcoQuery = gql`
  query pCOQuery($pCId: UUID!) {
    propertyCollectionById(id: $pCId) {
      id
      vPropertyCollectionKeysByPropertyCollectionId(
        filter: { propertyCollectionId: { equalTo: $pCId } }
      ) {
        totalCount
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
              email
            }
          }
        }
      }
      propertyCollectionObjectsByPropertyCollectionId {
        totalCount
        nodes {
          id
          objectId
          objectByObjectId {
            id
            name
          }
          properties
        }
      }
    }
  }
`
const pcoPreviewQuery = gql`
  query pCOPreviewQuery($pCId: UUID!, $first: Int!) {
    propertyCollectionById(id: $pCId) {
      id
      vPropertyCollectionKeysByPropertyCollectionId(
        filter: { propertyCollectionId: { equalTo: $pCId } }
      ) {
        totalCount
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
              email
            }
          }
        }
      }
      propertyCollectionObjectsByPropertyCollectionId(first: $first) {
        totalCount
        nodes {
          id
          objectId
          objectByObjectId {
            id
            name
          }
          properties
        }
      }
    }
  }
`

const PCO = () => {
  const client = useApolloClient()
  const store = useContext(storeContext)
  const { login } = store
  const activeNodeArray = getSnapshot(store.activeNodeArray)
  const pCId =
    activeNodeArray.length > 0
      ? activeNodeArray[1]
      : '99999999-9999-9999-9999-999999999999'

  const [count, setCount] = useState(15)

  const [xlsxExportLoading, setXlsxExportLoading] = useState(false)
  const [csvExportLoading, setCsvExportLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const { refetch: treeDataRefetch } = useQuery(treeQuery, {
    variables: treeQueryVariables(store),
  })
  const {
    data: pcoData,
    loading: pcoLoading,
    error: pcoError,
    refetch: pcoRefetch,
  } = useQuery(pcoPreviewQuery, {
    variables: {
      pCId,
      first: count,
    },
  })

  const [orderBy, setOrderBy] = useState('Objekt Name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [importing, setImport] = useState(false)

  const propKeys = (
    pcoData?.propertyCollectionById
      ?.vPropertyCollectionKeysByPropertyCollectionId?.nodes ?? []
  ).map((k) => k?.keys)

  const [pCO, pCORaw] = useMemo(() => {
    let pCO = []
    // collect all keys
    const pCORaw = (
      pcoData?.propertyCollectionById
        ?.propertyCollectionObjectsByPropertyCollectionId?.nodes ?? []
    ).map((p) => omit(p, ['__typename']))
    pCORaw.forEach((p) => {
      let nP = {}
      nP['Objekt ID'] = p.objectId
      nP['Objekt Name'] = p?.objectByObjectId?.name ?? null
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
      pCO.push(nP)
    })
    pCO = doOrderBy(pCO, orderBy, sortDirection)
    return [pCO, pCORaw]
  }, [
    pcoData?.propertyCollectionById
      ?.propertyCollectionObjectsByPropertyCollectionId?.nodes,
    propKeys,
    sortDirection,
    orderBy,
  ])
  // collect all keys and sort property keys by name
  const keys = ['Objekt ID', 'Objekt Name', ...propKeys.sort()]
  const pCOWriters = (
    pcoData?.propertyCollectionById?.organizationByOrganizationId
      ?.organizationUsersByOrganizationId?.nodes ?? []
  ).filter((u) => ['orgAdmin', 'orgCollectionWriter'].includes(u.role))
  const writerNames = union(pCOWriters.map((w) => w.userByUserId.name))
  const { username } = login
  const userIsWriter = !!username && writerNames.includes(username)
  const showImportPco = (pCO.length === 0 && userIsWriter) || importing

  const totalCount =
    pcoData?.propertyCollectionById
      ?.propertyCollectionObjectsByPropertyCollectionId?.totalCount

  // enable sorting
  const setOrder = useCallback(({ orderBy, direction }) => {
    setOrderBy(orderBy)
    setSortDirection(direction.toLowerCase())
  }, [])

  const fetchAllData = useCallback(async () => {
    const { data, loading, error } = await client.query({
      query: pcoQuery,
      variables: {
        pCId,
      },
    })
    // collect all keys
    const pCOUnsorted = (
      data?.propertyCollectionById
        ?.propertyCollectionObjectsByPropertyCollectionId?.nodes ?? []
    ).map((p) => {
      let nP = {}
      nP['Objekt ID'] = p.objectId
      nP['Objekt Name'] = p?.objectByObjectId?.name ?? null
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
    const pCO = doOrderBy(pCOUnsorted, orderBy, sortDirection)
    return { data: pCO, loading, error }
  }, [client, pCId, propKeys, sortDirection, orderBy])

  const onClickXlsx = useCallback(async () => {
    // download all data
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
      mutation: deletePcoOfPcMutation,
      variables: { pcId: pCId },
    })
    pcoRefetch()
    treeDataRefetch()
  }, [client, pCId, pcoRefetch, treeDataRefetch])

  const onClickImport = useCallback(() => {
    setImport(true)
  }, [])

  if (pcoLoading) {
    return <Spinner />
  }
  if (pcoError) {
    return <Container>{`Error fetching data: ${pcoError.message}`}</Container>
  }

  return (
    <Container>
      {!showImportPco && (
        <TotalDiv>
          {`${totalCount.toLocaleString(
            'de-CH',
          )} Datensätze, ${propKeys.length.toLocaleString('de-CH')} Feld${
            propKeys.length === 1 ? '' : 'er'
          }${pCO.length > 0 ? ':' : ''}, Erste `}
          <CountInput count={count} setCount={setCount} />
          {' :'}
        </TotalDiv>
      )}
      {!importing && pCO.length > 0 && (
        <>
          <DataTable
            data={pCO}
            idKey="Objekt ID"
            keys={keys}
            setOrder={setOrder}
            orderBy={orderBy}
            order={sortDirection}
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
      {showImportPco && <ImportPco setImport={setImport} pCO={pCORaw} />}
    </Container>
  )
}

export default observer(PCO)
