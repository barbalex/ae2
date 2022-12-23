import React, { useState, useCallback, useContext } from 'react'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Icon from '@mui/material/Icon'
import { MdExpandMore as ExpandMoreIcon } from 'react-icons/md'
import styled from '@emotion/styled'
import { useQuery, gql } from '@apollo/client'
import { observer } from 'mobx-react-lite'

import AllChooser from './AllChooser'
import Properties from './Properties'
import storeContext from '../../../../../../../storeContext'
import ErrorBoundary from '../../../../../../shared/ErrorBoundary'
import Spinner from '../../../../../../shared/Spinner'

const PropertiesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`
const StyledCard = styled(Card)`
  margin: 0;
  background-color: rgb(255, 243, 224) !important;
`
const StyledCardActions = styled(CardActions)`
  justify-content: space-between;
  cursor: pointer;
  background-color: #fff3e0;
  border-bottom: 1px solid #ebebeb;
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  height: auto !important;
  display: flex;
`
const CardActionIconButton = styled(IconButton)`
  transform: ${(props) => (props['data-expanded'] ? 'rotate(180deg)' : 'none')};
`
const CardActionTitle = styled.div`
  padding-left: 8px;
  font-weight: bold;
  word-break: break-word;
`
const StyledCollapse = styled(Collapse)`
  padding: 8px 20px;
`
const Count = styled.span`
  font-size: x-small;
  padding-left: 5px;
`
const SpinnerContainer = styled.div`
  padding-top: 15px;
`

const query = gql`
  query exportRcoPerRcoRelationQuery(
    $exportTaxonomies: [String!]
    $pcname: String!
    $relationtype: String!
  ) {
    exportRcoPerRcoRelation(
      exportTaxonomies: $exportTaxonomies
      pcname: $pcname
      relationtype: $relationtype
    ) {
      nodes {
        pcname
        property
        jsontype
      }
    }
  }
`

const RCO = ({ pcname, relationtype, count }) => {
  const store = useContext(storeContext)
  const exportTaxonomies = store.export.taxonomies.toJSON()
  console.log('RCO nodes:', { pcname, relationtype, count, exportTaxonomies })

  const { data, loading, error } = useQuery(query, {
    variables: {
      exportTaxonomies,
      pcname,
      relationtype,
    },
  })

  // spread to prevent node is not extensible error
  const nodes = [...(data?.exportRcoPerRcoRelation?.nodes ?? [])]
  // TODO: if no node without property exists, add one (for Beziehungspartner)
  const nodesWithoutProperty = nodes.filter((n) => !n.property)
  if (nodesWithoutProperty.length === 0) {
    nodes.unshift({
      pcname,
      property: null,
      jsontype: null,
    })
  }
  console.log('RCO nodes:', nodes)

  const [expanded, setExpanded] = useState(false)

  const onClickActions = useCallback(() => setExpanded(!expanded), [expanded])

  const columns = nodes.map((n) => n.property ?? 'Beziehungspartner')

  if (error) return `Error fetching data: ${error.message}`

  if (loading) {
    return (
      <SpinnerContainer>
        <Spinner message="" />
      </SpinnerContainer>
    )
  }

  return (
    <ErrorBoundary>
      <StyledCard>
        <StyledCardActions disableSpacing onClick={onClickActions}>
          <CardActionTitle>
            {`${pcname}: ${relationtype}`}
            <Count>{`(${count} ${count === 1 ? 'Feld' : 'Felder'})`}</Count>
          </CardActionTitle>
          <CardActionIconButton
            data-expanded={expanded}
            aria-expanded={expanded}
            aria-label="Show more"
          >
            <Icon>
              <ExpandMoreIcon />
            </Icon>
          </CardActionIconButton>
        </StyledCardActions>
        <StyledCollapse in={expanded} timeout="auto" unmountOnExit>
          {/* TODO: create component that queries properties and their jsontypes */}
          <>
            {count > 1 && (
              <div>AllChooser</div>
              // <AllChooser properties={rcoPropertiesByPropertyCollection[pcname]} />
            )}
            <PropertiesContainer>
              <Properties properties={nodes} columns={columns} />
            </PropertiesContainer>
          </>
        </StyledCollapse>
      </StyledCard>
    </ErrorBoundary>
  )
}

export default observer(RCO)
