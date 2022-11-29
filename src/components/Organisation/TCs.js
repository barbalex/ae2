import React, { useContext } from 'react'
import sortBy from 'lodash/sortBy'
import styled from '@emotion/styled'
import { useQuery, gql } from '@apollo/client'
import { observer } from 'mobx-react-lite'
import { getSnapshot } from 'mobx-state-tree'

import appBaseUrl from '../../modules/appBaseUrl'
import storeContext from '../../storeContext'
import Spinner from '../shared/Spinner'
import ErrorBoundary from '../shared/ErrorBoundary'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 10px;
`
const List = styled.div`
  column-width: 400px;
  margin-bottom: 10px;
  ul {
    -webkit-margin-before: 0px;
  }
`
const StyledA = styled.a`
  color: inherit;
  cursor: pointer;
  text-decoration-color: rgba(0, 0, 0, 0.3);
  text-decoration-style: dotted;
`

const tcsQuery = gql`
  query orgTCsQuery($id: UUID!) {
    organizationById(id: $id) {
      id
      taxonomiesByOrganizationId {
        totalCount
        nodes {
          id
          name
        }
      }
    }
  }
`

const TCs = () => {
  const store = useContext(storeContext)
  const activeNodeArray = getSnapshot(store.activeNodeArray)
  const id =
    activeNodeArray.length > 1
      ? activeNodeArray[1]
      : '99999999-9999-9999-9999-999999999999'

  const {
    data: tcsData,
    loading: tcsLoading,
    error: tcsError,
  } = useQuery(tcsQuery, {
    variables: {
      id,
    },
  })

  const tcs = sortBy(
    tcsData?.organizationById?.taxonomiesByOrganizationId?.nodes ?? [],
    'name',
  )

  if (tcsLoading) return <Spinner />
  if (tcsError) return <Container>{`Fehler: ${tcsError.message}`}</Container>

  return (
    <ErrorBoundary>
      <Container>
        <List>
          <ul>
            {tcs.map((u) => {
              const elem2 = u.type === 'ART' ? 'Arten' : 'Lebensräume'
              const link = `${appBaseUrl}/${encodeURIComponent(elem2)}/${u.id}`

              return (
                <li key={u.name}>
                  <StyledA href={link} target="_blank">
                    {u.name}
                  </StyledA>
                </li>
              )
            })}
          </ul>
        </List>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(TCs)
