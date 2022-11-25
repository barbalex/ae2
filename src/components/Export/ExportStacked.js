import React, { useState, useCallback, useContext } from 'react'
import Paper from '@mui/material/Paper'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'

import ChooseColumn from './ChooseColumn'
import PreviewColumn from './PreviewColumn'
import storeContext from '../../storeContext'

const StyledPaper = styled(Paper)`
  background-color: #ffcc80 !important;
`
const Content = styled.div`
  height: 100%;
`

const ExportStacked = () => {
  const store = useContext(storeContext)
  const { windowWidth } = store
  const [tab, setTab] = useState(0)

  const onChangeTab = useCallback((event, value) => {
    setTab(value)
  }, [])

  return (
    <>
      <StyledPaper>
        <Tabs
          variant="fullWidth"
          value={tab}
          onChange={onChangeTab}
          indicatorColor="primary"
        >
          <Tab label="Auswählen" />
          <Tab label="Vorschau" />
        </Tabs>
      </StyledPaper>
      <Content>
        {tab === 0 && <ChooseColumn dimensions={{ width: windowWidth }} />}
        {tab === 1 && <PreviewColumn dimensions={{ width: windowWidth }} />}
      </Content>
    </>
  )
}

export default observer(ExportStacked)
