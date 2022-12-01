import React, { useEffect, useCallback, useState, useContext } from 'react'
import { graphql, navigate } from 'gatsby'
import styled from '@emotion/styled'
import Paper from '@mui/material/Paper'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import SimpleBar from 'simplebar-react'
import { withResizeDetector } from 'react-resize-detector'
import { observer } from 'mobx-react-lite'

import Layout from '../components/Layout'
import ErrorBoundary from '../components/shared/ErrorBoundary'
import Sidebar from './Sidebar'
import useLocation from '../modules/useLocation'
import storeContext from '../storeContext'

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
  h4,
  ol {
    margin-bottom: 10px;
  }
  h2 {
    margin-top: 10px;
    margin-bottom: 10px;
  }
`
const DokuDate = styled.p`
  margin-bottom: 15px !important;
  color: grey;
`
const StyledPaper = styled(Paper)`
  background-color: #ffcc80 !important;
`
const Content = styled.div`
  height: 100%;
`

const DocTemplate = ({ data, height, width }) => {
  const store = useContext(storeContext)
  const { windowWidth } = store

  const { markdownRemark, allMarkdownRemark } = data
  const frontmatter = markdownRemark?.frontmatter
  const html = markdownRemark?.html ?? `<div>no data</div>`
  const { edges } = allMarkdownRemark

  const { pathname } = useLocation()
  const pathElements = pathname.split('/').filter((p) => !!p)

  const [tab, setTab] = useState(0)
  const onChangeTab = useCallback(
    (event, value) => {
      setTab(value)
      console.log('docTemplate, onChangeTab, value:', value)
      if (value === 0) {
        // eslint-disable-next-line no-unused-vars
        const [first, ...rest] = pathElements
        console.log('docTemplate, onChangeTab:', { first, pathElements })
        navigate(`${first}/`)
      }
    },
    [pathElements],
  )

  console.log('docTemplate', { width, windowWidth })

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
    console.log('docTemplate, useEffect2:', { pathElements, tab })
    pathElements.length > 1 && tab === 0 && setTab(1)
    pathElements.length === 1 && tab === 1 && setTab(0)
  }, [pathElements, tab])

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
              <SimpleBar
                style={{ maxHeight: height, height: '100%', width: '100%' }}
              >
                <Doku>
                  <h1>{frontmatter?.title ?? 'no title'}</h1>
                  <DokuDate>{frontmatter.date ?? 'no date'}</DokuDate>
                  <div dangerouslySetInnerHTML={{ __html: html }} />
                </Doku>
              </SimpleBar>
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
          <SimpleBar
            style={{ maxHeight: height, height: '100%', width: '100%' }}
          >
            <Doku>
              <h1>{frontmatter?.title ?? 'no title'}</h1>
              <DokuDate>{frontmatter.date ?? 'no date'}</DokuDate>
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </Doku>
          </SimpleBar>
        </Container>
      </Layout>
    </ErrorBoundary>
  )
}

export const pageQuery = graphql`
  query ($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      html
      frontmatter {
        date(formatString: "DD.MM.YYYY")
        path
        title
      }
    }
    allMarkdownRemark(
      # sort: { frontmatter: { sort1: ASC } }  TODO: migrate gatsby v5
      sort: { order: ASC, fields: [frontmatter___sort1] }
      filter: { fileAbsolutePath: { regex: "/(/docs)/.*.md$/" } }
    ) {
      edges {
        node {
          id
          frontmatter {
            date(formatString: "DD.MM.YYYY")
            path
            title
            sort1
          }
        }
      }
    }
  }
`

export default withResizeDetector(observer(DocTemplate))
