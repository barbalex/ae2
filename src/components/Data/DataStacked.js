import React, { useState, useCallback, useContext } from 'react'
import Paper from '@mui/material/Paper'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import styled from '@emotion/styled'
import { observer } from 'mobx-react-lite'

import Tree from '../Tree'
import DataType from '../DataType'
import storeContext from '../../storeContext'

const StyledPaper = styled(Paper)`
  background-color: #ffcc80 !important;
`
const Content = styled.div`
  /* the following height is needed for home to scroll */
  height: ${(props) => props['data-height']}px;
`

const DataStacked = () => {
  const store = useContext(storeContext)
  const { windowWidth, windowHeight } = store

  const [tab, setTab] = useState(0)
  const onChangeTab = useCallback((event, value) => setTab(value), [])

  return (
    <>
      <StyledPaper>
        <Tabs
          variant="fullWidth"
          value={tab}
          onChange={onChangeTab}
          indicatorColor="primary"
        >
          <Tab label="Navigation" />
          <Tab label="Formular" disabled={false} />
        </Tabs>
      </StyledPaper>
      <Content data-height={windowHeight - 103}>
        {tab === 0 && <Tree />}
        {tab === 1 && (
          <DataType stacked={true} dimensions={{ width: windowWidth }} />
        )}
      </Content>
    </>
  )
}

export default observer(DataStacked)
