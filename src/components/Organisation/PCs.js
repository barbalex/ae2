// @flow
import React, { useContext } from 'react'
import get from 'lodash/get'
import sortBy from 'lodash/sortBy'
import styled from 'styled-components'
import { useQuery } from 'react-apollo-hooks'
import gql from 'graphql-tag'
import { observer } from 'mobx-react-lite'

import appBaseUrl from '../../modules/appBaseUrl'
import ErrorBoundary from '../shared/ErrorBoundary'
import mobxStoreContext from '../../mobxStoreContext'

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
  font-weight: 100;
  cursor: pointer;
  text-decoration-color: rgba(0, 0, 0, 0.3);
  text-decoration-style: dotted;
`

const pcsQuery = gql`
  query orgPCsQuery($name: String!) {
    organizationByName(name: $name) {
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
  const mobxStore = useContext(mobxStoreContext)
  const { activeNodeArray } = mobxStore
  const name = activeNodeArray.length > 1 ? activeNodeArray[1] : 'none'

  const { data: pcsData, loading: pcsLoading, error: pcsError } = useQuery(
    pcsQuery,
    {
      suspend: false,
      variables: {
        name,
      },
    },
  )

  const pcs = sortBy(
    get(
      pcsData,
      'organizationByName.propertyCollectionsByOrganizationId.nodes',
      [],
    ),
    'name',
  )

  if (pcsLoading) return <Container>Lade Daten...</Container>
  if (pcsError) return <Container>{`Fehler: ${pcsError.message}`}</Container>

  return (
    <ErrorBoundary>
      <Container>
        <List>
          <ul>
            {pcs.map(u => (
              <li key={u.name}>
                <StyledA
                  href={`${appBaseUrl}Eigenschaften-Sammlungen/${u.id}`}
                  target="_blank"
                >
                  {u.name}
                </StyledA>
              </li>
            ))}
            )}
          </ul>
        </List>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(PCs)
