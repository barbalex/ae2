import React, { useContext } from 'react'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Icon from '@mui/material/Icon'
import { MdExpandMore as ExpandMoreIcon } from 'react-icons/md'
import styled from '@emotion/styled'
import { useQuery, gql } from '@apollo/client'
import { observer } from 'mobx-react-lite'

import storeContext from '../../../../../storeContext'
import ErrorBoundary from '../../../../shared/ErrorBoundary'
import List from './List'

const Container = styled.div`
  margin: 10px 0;
`
const ErrorContainer = styled.div`
  padding: 5px;
`
const StyledCard = styled(Card)`
  background-color: rgb(255, 243, 224) !important;
`
const StyledCardActions = styled(CardActions)`
  justify-content: space-between;
  cursor: pointer;
  height: auto !important;
  background-color: #ffcc80;
`
const CardActionIconButton = styled(IconButton)`
  transform: ${(props) => (props['data-expanded'] ? 'rotate(180deg)' : 'none')};
`
const CardActionTitle = styled.div`
  padding-left: 8px;
  font-weight: bold;
  word-break: break-word;
`
const Count = styled.span`
  font-size: x-small;
  padding-left: 5px;
`

const query = gql`
  query propsByTaxDataQueryForFilterRCOs($exportTaxonomies: [String!]) {
    pc_count: allPropertyCollections(
      filter: {
        relationsByPropertyCollectionId: {
          some: {
            objectByObjectId: {
              taxonomyByTaxonomyId: { name: { in: $exportTaxonomies } }
            }
          }
        }
      }
    ) {
      totalCount
    }
    property_count: rcoPropertiesByTaxonomiesCountFunction(
      exportTaxonomies: $exportTaxonomies
    )
  }
`

const RcosCard = ({ rcoExpanded, onToggleRco }) => {
  const store = useContext(storeContext)
  const exportTaxonomies = store.export.taxonomies.toJSON()

  const { data, error, loading } = useQuery(query, {
    variables: {
      exportTaxonomies,
    },
  })

  const pcCount = data?.pc_count?.totalCount ?? 0
  const propertyCount = data?.property_count ?? 0

  if (error) {
    return (
      <ErrorContainer>`Error loading data: ${error.message}`</ErrorContainer>
    )
  }

  return (
    <ErrorBoundary>
      <Container>
        <StyledCard>
          <StyledCardActions disableSpacing onClick={onToggleRco}>
            <CardActionTitle>
              Beziehungssammlungen
              {
                <Count>{`(${
                  loading ? '...' : pcCount
                } Sammlungen, ${propertyCount} ${
                  loading ? '...' : propertyCount === 1 ? 'Feld' : 'Felder'
                })`}</Count>
              }
            </CardActionTitle>
            <CardActionIconButton
              data-expanded={rcoExpanded}
              aria-expanded={rcoExpanded}
              aria-label="Show more"
            >
              <Icon>
                <ExpandMoreIcon />
              </Icon>
            </CardActionIconButton>
          </StyledCardActions>
          <Collapse in={rcoExpanded} timeout="auto" unmountOnExit>
            <List />
          </Collapse>
        </StyledCard>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(RcosCard)
