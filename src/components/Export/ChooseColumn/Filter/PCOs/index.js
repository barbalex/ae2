import React, { useContext } from 'react'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Icon from '@mui/material/Icon'
import { MdExpandMore as ExpandMoreIcon } from 'react-icons/md'
import styled from '@emotion/styled'
import groupBy from 'lodash/groupBy'
import { useQuery, gql } from '@apollo/client'
import { observer } from 'mobx-react-lite'

import PCO from './PCO'
import storeContext from '../../../../../storeContext'
import ErrorBoundary from '../../../../shared/ErrorBoundary'

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
  query propsByTaxDataQueryForFilterPCOs($exportTaxonomies: [String!]) {
    pc_count: allPropertyCollections(
      filter: {
        propertyCollectionObjectsByPropertyCollectionId: {
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
    property_count: pcoPropertiesByTaxonomiesCountFunction(
      exportTaxonomies: $exportTaxonomies
    )
  }
`

const PcosCard = ({ pcoExpanded, onTogglePco }) => {
  const store = useContext(storeContext)
  const exportTaxonomies = store.export.taxonomies.toJSON()

  const { data, error, loading } = useQuery(query, {
    variables: {
      exportTaxonomies,
    },
  })
  // TODO:
  const pcoProperties = data?.pcoPropertiesByTaxonomiesFunction?.nodes ?? []
  const pcoPropertiesByPropertyCollection = groupBy(
    pcoProperties,
    'propertyCollectionName',
  )
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
          <StyledCardActions disableSpacing onClick={onTogglePco}>
            <CardActionTitle>
              Eigenschaftensammlungen
              <Count>{`(${loading ? '...' : pcCount} Sammlungen, ${
                loading ? '...' : propertyCount
              } ${propertyCount === 1 ? 'Feld' : 'Felder'})`}</Count>
            </CardActionTitle>
            <CardActionIconButton
              data-expanded={pcoExpanded}
              aria-expanded={pcoExpanded}
              aria-label="Show more"
            >
              <Icon>
                <ExpandMoreIcon />
              </Icon>
            </CardActionIconButton>
          </StyledCardActions>
          <Collapse in={pcoExpanded} timeout="auto" unmountOnExit>
            {Object.keys(pcoPropertiesByPropertyCollection).map((pc) => (
              <PCO key={pc} pc={pc} />
            ))}
          </Collapse>
        </StyledCard>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(PcosCard)
