// @flow
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex'
import styled from 'styled-components'
import { observer, inject } from 'mobx-react'
import compose from 'recompose/compose'

import AppBar from './AppBar'
import TreeCategories from './TreeCategories'
import Main from './Main'

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`

const enhance = compose(inject('store'), withRouter, observer)

class App extends Component {
  props: {
    store: Object,
    location: Object,
    history: Object,
  }

  componentWillMount() {
    const { location, history } = this.props
    if (location.pathname === '/') {
      history.push('/Taxonomien')
    }
  }

  render() {
    const { store } = this.props

    return (
      <Container>
        <AppBar />
        <ReflexContainer orientation="vertical">
          {store.ui.visibleColumns.tree &&
            <ReflexElement><TreeCategories /></ReflexElement>}
          {store.ui.visibleColumns.tree &&
            store.ui.visibleColumns.main &&
            <ReflexSplitter key="treeSplitter" />}
          {store.ui.visibleColumns.main &&
            <ReflexElement><Main /></ReflexElement>}
        </ReflexContainer>
      </Container>
    )
  }
}

export default enhance(App)
