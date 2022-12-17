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
import { withResizeDetector } from 'react-resize-detector'

import AllChooser from './AllChooser'
import Properties from './Properties'
import storeContext from '../../../../../../storeContext'
import ErrorBoundary from '../../../../../shared/ErrorBoundary'
import getConstants from '../../../../../../modules/constants'
import Spinner from '../../../../../shared/Spinner'

const constants = getConstants()

const StyledCard = styled(Card)`
  margin: 0;
  background-color: rgb(255, 243, 224) !important;
`
const StyledCardActions = styled(CardActions)`
  justify-content: space-between;
  cursor: pointer;
  height: auto !important;
  background-color: #fff3e0;
  border-bottom: 1px solid #ebebeb;
`
const CardActionIconButton = styled(IconButton)`
  transform: ${(props) => (props['data-expanded'] ? 'rotate(180deg)' : 'none')};
`
const CardActionTitle = styled.div`
  padding-left: 8px;
  font-weight: bold;
  word-break: break-word;
`
const PropertiesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
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
  width: 100%;
`

const query = gql`
  query propsByTaxDataQueryForFilterPCO(
    $exportTaxonomies: [String]
    $pcName: String!
  ) {
    pcoPropertiesByTaxonomiesAndPc(
      taxonomyNames: $exportTaxonomies
      pcName: $pcName
    ) {
      totalCount
      nodes {
        property
        type
      }
    }
  }
`

const PCO = ({ pcName, count, width = 500 }) => {
  const store = useContext(storeContext)
  const exportTaxonomies = store.export.taxonomies.toJSON()

  const { data, error, loading } = useQuery(query, {
    variables: {
      exportTaxonomies,
      pcName,
    },
  })

  const properties = data?.pcoPropertiesByTaxonomiesAndPc?.nodes ?? []

  const [expanded, setExpanded] = useState(false)
  const onClickActions = useCallback(() => setExpanded(!expanded), [expanded])

  const columns = Math.floor(width / constants.export.properties.columnWidth)

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
            {pcName}
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
          <>
            {count > 1 && <AllChooser properties={properties} pcName={pcName} />}
            <PropertiesContainer>
              <Properties properties={properties} columns={columns} pcName={pcName} />
            </PropertiesContainer>
          </>
        </StyledCollapse>
      </StyledCard>
    </ErrorBoundary>
  )
}

export default withResizeDetector(observer(PCO))
