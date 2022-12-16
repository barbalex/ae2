import React, { useCallback, useState } from 'react'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Icon from '@mui/material/Icon'
import { MdExpandMore as ExpandMoreIcon } from 'react-icons/md'
import styled from '@emotion/styled'
import { withResizeDetector } from 'react-resize-detector'

import Properties from './Properties'
import ErrorBoundary from '../../../../../shared/ErrorBoundary'
import getConstants from '../../../../../../modules/constants'
const constants = getConstants()

const StyledCard = styled(Card)`
  margin: 0;
  background-color: rgb(255, 243, 224) !important;
`
const StyledCardActions = styled(CardActions)`
  justify-content: space-between;
  cursor: pointer;
  border-bottom: 1px solid rgba(0, 0, 0, 0.3);
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  height: auto !important;
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
const PropertiesContainer = styled.div`
  margin: 8px 0;
  padding-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
`

const PcoCard = ({ pc, count, width = 500 }) => {
  const [expanded, setExpanded] = useState(false)

  const columns = Math.floor(width / constants.export.properties.columnWidth)

  const onClickAction = useCallback(() => setExpanded(!expanded), [expanded])

  return (
    <ErrorBoundary>
      <StyledCard key={pc}>
        <StyledCardActions disableSpacing onClick={onClickAction}>
          <CardActionTitle>
            {pc}
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
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <PropertiesContainer>
            {expanded && <Properties pc={pc} columns={columns} />}
          </PropertiesContainer>
        </Collapse>
      </StyledCard>
    </ErrorBoundary>
  )
}

export default withResizeDetector(PcoCard)
