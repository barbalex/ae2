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

const rcoQuery = gql`
  query rCOQuery($pCId: UUID!) {
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

const RCO = () => {
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
    data: rcoData,
    loading: rcoLoading,
    error: rcoError,
    refetch: rcoRefetch,
  } = useQuery(rcoQuery, {
    variables: {
      pCId,
    },
  })

  const [sortField, setSortField] = useState('Objekt Name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [importing, setImport] = useState(false)

  const { width, height, ref: resizeRef } = useResizeObserver()
  console.log('RCO', { width, height })

  const [rCO, propKeys, rCORaw] = useMemo(() => {
    let rCO = []
    // collect all keys
    const propKeys = new Set()
    const rCORaw = (
      rcoData?.propertyCollectionById?.relationsByPropertyCollectionId?.nodes ??
      []
    ).map((p) => omit(p, ['__typename']))
    rCORaw.forEach((p) => {
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
          // collect all keys
          propKeys.add(key)
        })
      }
      rCO.push(nP)
    })
    rCO = orderBy(rCO, sortField, sortDirection)
    return [rCO, propKeys, rCORaw]
  }, [rcoData, sortDirection, sortField])
  // collect all keys and sort property keys by name
  const keys = [
    'Objekt ID',
    'Objekt Name',
    'Beziehung ID',
    'Beziehung Name',
    'Art der Beziehung',
    ...Array.from(propKeys).sort(),
  ]
  const rCOWriters = (
    rcoData?.propertyCollectionById?.organizationByOrganizationId
      ?.organizationUsersByOrganizationId?.nodes ?? []
  ).filter((u) => ['orgAdmin', 'orgCollectionWriter'].includes(u.role))
  const writerNames = union(rCOWriters.map((w) => w.userByUserId.name))
  const { username } = login
  const userIsWriter = !!username && writerNames.includes(username)
  const showImportRco = (rCO.length === 0 && userIsWriter) || importing

  const onGridSort = useCallback((column, direction) => {
    setSortField(column)
    setSortDirection(direction.toLowerCase())
  }, [])
  const onClickXlsx = useCallback(
    () =>
      exportXlsx({
        rows: rCO,
        onSetMessage: console.log,
      }),
    [rCO],
  )
  const onClickCsv = useCallback(() => exportCsv(rCO), [rCO])
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
    <Container ref={resizeRef}>
      {!showImportRco && (
        <TotalDiv>{`${rCO.length.toLocaleString(
          'de-CH',
        )} Datensätze, ${propKeys.size.toLocaleString('de-CH')} Feld${
          propKeys.size === 1 ? '' : 'er'
        }${rCO.length > 0 ? ':' : ''}`}</TotalDiv>
      )}
      {!importing && rCO.length > 0 && width && height && (
        <>
          <DataTable data={rCO} idKey="Objekt ID" keys={keys} />
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
      {showImportRco && <ImportRco setImport={setImport} pCO={rCORaw} />}
    </Container>
  )
}

export default observer(RCO)
