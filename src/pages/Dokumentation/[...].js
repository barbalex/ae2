import React, { useCallback, useEffect, useState, useContext } from 'react'
import { graphql } from 'gatsby'
import styled from '@emotion/styled'
import Paper from '@mui/material/Paper'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { observer } from 'mobx-react-lite'

import Layout from '../../components/Layout'
import ErrorBoundary from '../../components/shared/ErrorBoundary'
import Sidebar from '../../templates/Sidebar'
import useLocation from '../../modules/useLocation'
import storeContext from '../../storeContext'
import Header from '../../components/Head'

const Container = styled.div`
  height: calc(100vh - 64px);
  display: flex;
`
const Doku = styled.div`
  width: 100%;
  padding: 25px;
  ul {
    margin-top: 0;
  }
  p,
  li {
    margin-bottom: 0;
  }
  h1,
  h3,
  ol {
    margin-bottom: 10px;
  }
  h2 {
    margin-top: 10px;
    margin-bottom: 10px;
  }
`
const StyledPaper = styled(Paper)`
  background-color: #ffcc80 !important;
`
const Content = styled.div`
  height: 100%;
`

const Dokumentation = ({ data }) => {
  const { singleColumnView } = useContext(storeContext)
  const { allMarkdownRemark } = data
  const { edges } = allMarkdownRemark
  const { pathname } = useLocation()
  const pathElements = pathname.split('/').filter((p) => !!p)

  const [tab, setTab] = useState(0)
  const onChangeTab = useCallback((event, value) => {
    setTab(value)
  }, [])

  const [stacked, setStacked] = useState(false)
  useEffect(() => {
    const w = window
    const d = document
    const e = d.documentElement
    const g = d.getElementsByTagName('body')[0]
    const windowWidth = w.innerWidth || e.clientWidth || g.clientWidth
    const stacked = windowWidth < 700
    setStacked(stacked)
  }, [])
  useEffect(() => {
    if (pathElements.length > 1 && tab === 0) setTab(1)
    // if (pathElements.length === 1 && tab === 1) setTab(0)
  }, [pathElements, tab])

  // TODO: singleColumnView is set in App.jsx which is not run if app started on this route!!!

  if (stacked) {
    return (
      <ErrorBoundary>
        <Layout>
          <StyledPaper>
            <Tabs
              variant="fullWidth"
              value={tab}
              onChange={onChangeTab}
              indicatorColor="primary"
            >
              <Tab label="Navigation" />
              <Tab label="Formular" />
            </Tabs>
          </StyledPaper>
          <Content>
            {tab === 0 && (
              <Sidebar
                title="Dokumentation"
                titleLink="/Dokumentation/"
                edges={edges}
                stacked={true}
              />
            )}
            {tab === 1 && (
              <Doku>
                <p>Hoffentlich nützliche Infos für Sie</p>
              </Doku>
            )}
          </Content>
        </Layout>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <Layout>
        <Container>
          <Sidebar
            title="Dokumentation"
            titleLink="/Dokumentation/"
            edges={edges}
          />
          <Doku>
            <p>Hoffentlich nützliche Infos für Sie</p>
          </Doku>
        </Container>
      </Layout>
    </ErrorBoundary>
  )
}

export const pageQuery = graphql`
  query {
    allMarkdownRemark(
      # sort: { frontmatter: { sort1: ASC } }  TODO: migrate gatsby v5
      sort: { order: ASC, fields: [frontmatter___sort1] }
      filter: { fileAbsolutePath: { regex: "/(/docs)/.*.md$/" } }
    ) {
      edges {
        node {
          id
          frontmatter {
            title
            date(formatString: "DD.MM.YYYY")
            path
          }
        }
      }
    }
  }
`

export default observer(Dokumentation)

export const Head = () => <Header />
