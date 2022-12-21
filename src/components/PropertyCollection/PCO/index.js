import React, { useState, useCallback, useContext, useMemo } from 'react'
import styled from '@emotion/styled'
import omit from 'lodash/omit'
import forOwn from 'lodash/forOwn'
import union from 'lodash/union'
import orderBy from 'lodash/orderBy'
import Button from '@mui/material/Button'
import { useQuery, useApolloClient, gql } from '@apollo/client'
import { observer } from 'mobx-react-lite'
import { getSnapshot } from 'mobx-state-tree'
import useResizeObserver from 'use-resize-observer'

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

// react-data-grid calls window!
const ReactDataGridLazy = React.lazy(() => import('react-data-grid'))

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
`

const pcoQuery = gql`
  query pCOQuery($pCId: UUID!) {
    propertyCollectionById(id: $pCId) {
      id
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

const PCO = () => {
  const isSSR = typeof window === 'undefined'
  const client = useApolloClient()
  const store = useContext(storeContext)
  const { login } = store
  const activeNodeArray = getSnapshot(store.activeNodeArray)
  const pCId =
    activeNodeArray.length > 0
      ? activeNodeArray[1]
      : '99999999-9999-9999-9999-999999999999'
  const { refetch: treeDataRefetch } = useQuery(treeQuery, {
    variables: treeQueryVariables(store),
  })
  const {
    data: pcoData,
    loading: pcoLoading,
    error: pcoError,
    refetch: pcoRefetch,
  } = useQuery(pcoQuery, {
    variables: {
      pCId,
    },
  })

  const [sortField, setSortField] = useState('Objekt Name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [importing, setImport] = useState(false)

  const { width, height, ref: resizeRef } = useResizeObserver()
  //console.log('PCO', { width, height })

  const [pCO, allKeys, pCORaw] = useMemo(() => {
    let pCO = []
    // collect all keys
    const allKeys = []
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
          // collect all keys
          allKeys.push(key)
        })
      }
      pCO.push(nP)
    })
    pCO = orderBy(pCO, sortField, sortDirection)
    return [pCO, allKeys, pCORaw]
  }, [pcoData, sortDirection, sortField])
  // collect all keys and sort property keys by name
  const keys = ['Objekt ID', 'Objekt Name', ...union(allKeys).sort()]
  const columns = keys.map((k) => ({
    key: k,
    name: k,
    resizable: true,
    sortable: true,
  }))
  const pCOWriters = (
    pcoData?.propertyCollectionById?.organizationByOrganizationId
      ?.organizationUsersByOrganizationId?.nodes ?? []
  ).filter((u) => ['orgAdmin', 'orgCollectionWriter'].includes(u.role))
  const writerNames = union(pCOWriters.map((w) => w.userByUserId.name))
  const { username } = login
  const userIsWriter = !!username && writerNames.includes(username)
  const showImportPco = (pCO.length === 0 && userIsWriter) || importing

  const onGridSort = useCallback((column, direction) => {
    setSortField(column)
    setSortDirection(direction.toLowerCase())
  }, [])
  const rowGetter = useCallback((i) => pCO[i], [pCO])
  const onClickXlsx = useCallback(
    () =>
      exportXlsx({
        rows: pCO,
        onSetMessage: console.log,
      }),
    [pCO],
  )
  const onClickCsv = useCallback(() => exportCsv(pCO), [pCO])
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
    <Container ref={resizeRef}>
      {!showImportPco && (
        <TotalDiv>{`${pCO.length.toLocaleString('de-CH')} Datensätze, ${(
          columns.length - 2
        ).toLocaleString('de-CH')} Feld${columns.length === 3 ? '' : 'er'}${
          pCO.length > 0 ? ':' : ''
        }`}</TotalDiv>
      )}
      {!importing && pCO.length > 0 && (
        <>
          <DataTable data={pCO} />
          {/* {width && height && !isSSR && (
            <React.Suspense fallback={<div />}>
              <ReactDataGridLazy
                onGridSort={onGridSort}
                columns={columns}
                rowGetter={rowGetter}
                rowsCount={pCO.length}
                minHeight={height - 26 - 46}
                minWidth={width}
              />
            </React.Suspense>
          )} */}
          <ButtonsContainer>
            <ExportButtons>
              <StyledButton
                onClick={onClickXlsx}
                variant="outlined"
                color="inherit"
              >
                xlsx exportieren
              </StyledButton>
              <StyledButton
                onClick={onClickCsv}
                variant="outlined"
                color="inherit"
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
                >
                  importieren
                </StyledButton>
                <StyledButton
                  onClick={onClickDelete}
                  variant="outlined"
                  color="inherit"
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
