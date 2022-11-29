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

const pcsQuery = gql`
  query orgPCsQuery($id: UUID!) {
    organizationById(id: $id) {
      id
      propertyCollectionsByOrganizationId {
        totalCount
        nodes {
          id
          name
        }
      }
    }
  }
`

const PCs = () => {
  const store = useContext(storeContext)
  const activeNodeArray = getSnapshot(store.activeNodeArray)
  const id =
    activeNodeArray.length > 1
      ? activeNodeArray[1]
      : '99999999-9999-9999-9999-999999999999'

  const {
    data: pcsData,
    loading: pcsLoading,
    error: pcsError,
  } = useQuery(pcsQuery, {
    variables: {
      id,
    },
  })

  const pcs = sortBy(
    pcsData?.organizationById?.propertyCollectionsByOrganizationId?.nodes ?? [],
    'name',
  )

  if (pcsLoading) return <Spinner />
  if (pcsError) return <Container>{`Fehler: ${pcsError.message}`}</Container>

  return (
    <ErrorBoundary>
      <Container>
        <List>
          <ul>
            {pcs.map((u) => (
              <li key={u.name}>
                <StyledA
                  href={`${appBaseUrl}Eigenschaften-Sammlungen/${u.id}`}
                  target="_blank"
                >
                  {u.name}
                </StyledA>
              </li>
            ))}
          </ul>
        </List>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(PCs)
