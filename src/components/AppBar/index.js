// @flow
import React, {
  lazy,
  Suspense,
  useRef,
  useState,
  useCallback,
  useEffect,
  useContext,
} from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Icon from '@material-ui/core/Icon'
import ShareIcon from '@material-ui/icons/Share'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import styled from 'styled-components'
import get from 'lodash/get'
import debounce from 'lodash/debounce'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { observer } from 'mobx-react-lite'

import ErrorBoundary from '../shared/ErrorBoundary'
import LazyImportFallback from '../shared/LazyImportFallback'
import getActiveObjectIdFromNodeArray from '../../modules/getActiveObjectIdFromNodeArray'
import historyContext from '../../historyContext'
import mobxStoreContext from '../../mobxStoreContext'

const MoreMenu = lazy(() => import('./MoreMenu'))

/**
 * For unknown reason appbar does not follow display flex when
 * user form is shown: user covers appbar!!??
 * Container with display block is needed to prevent that
 */
const Container = styled.div`
  display: block;
`
const StyledAppBar = styled(AppBar)`
  background-color: #e65100 !important;
  @media print {
    display: none !important;
  }
`
const StyledToolbar = styled(Toolbar)`
  flex-wrap: wrap;
`
const StyledTypography = styled(Typography)`
  flex: 1;
  color: white !important;
  margin-right: 12px !important;
`
const StyledButton = styled(Button)`
  color: rgb(255, 255, 255) !important;
  border: ${props => (props['data-active'] ? '1px solid !important' : 'none')};
  margin: 8px;
`
const LoginButton = styled(StyledButton)`
  min-width: ${props =>
    props['data-widelayout'] ? 'inherit' : '40px !important'};
  max-width: ${props => (props['data-widelayout'] ? 'inherit' : '40px')};
`
const ShareButton = styled(StyledButton)`
  min-width: 40px !important;
  max-width: 40px;
`
const StyledMoreVertIcon = styled(ShareIcon)`
  color: white !important;
`
const getInitials = name => name.match(/\b(\w)/g).join('')

const query = gql`
  query ObjectQuery(
    $objectId: UUID!
    $existsObjectId: Boolean!
    $pCId: UUID!
    $existsPCId: Boolean!
    $taxId: UUID!
    $existsTaxId: Boolean!
  ) {
    objectById(id: $objectId) @include(if: $existsObjectId) {
      id
      name
    }
    propertyCollectionById(id: $pCId) @include(if: $existsPCId) {
      id
      name
    }
    taxonomyById(id: $taxId) @include(if: $existsTaxId) {
      id
      name
    }
  }
`

const MyAppBar = () => {
  const history = useContext(historyContext)
  const mobxStore = useContext(mobxStoreContext)
  const { login } = mobxStore
  const activeNodeArray = mobxStore.activeNodeArray.toJS()

  const objectId = getActiveObjectIdFromNodeArray(activeNodeArray)
  let pCId = '99999999-9999-9999-9999-999999999999'
  if (activeNodeArray[0] === 'Eigenschaften-Sammlungen' && activeNodeArray[1]) {
    pCId = activeNodeArray[1]
  }
  const existsPCId = pCId !== '99999999-9999-9999-9999-999999999999'
  let taxId = '99999999-9999-9999-9999-999999999999'
  if (
    ['Arten', 'Lebensräume'].includes(activeNodeArray[0]) &&
    activeNodeArray[1]
  ) {
    taxId = activeNodeArray[1]
  }
  const existsTaxId = taxId !== '99999999-9999-9999-9999-999999999999'
  const { data, error: dataError } = useQuery(query, {
    suspend: false,
    variables: {
      objectId: objectId || '99999999-9999-9999-9999-999999999999',
      existsObjectId: !!objectId,
      pCId,
      existsPCId,
      taxId,
      existsTaxId,
    },
  })
  /**
   * need to measure all buttons width
   * to change them when view is too narrow
   */
  /**
   * need to set divs around Toolbar and Buttons
   * because measure ref needs to be on a real element
   */
  /**
   * need to set wideLayout using state in an effect
   * because setting it needs to be debounced
   */
  const [wideLayout, setWideLayout] = useState(true)

  const toolbarC = useRef(null)
  const datenC = useRef(null)
  const exportC = useRef(null)
  const loginC = useRef(null)
  const moreC = useRef(null)
  const shareC = useRef(null)

  const url0 = activeNodeArray[0] && activeNodeArray[0].toLowerCase()
  const { username } = login
  const loginLabel = username
    ? wideLayout
      ? username
      : getInitials(username)
    : wideLayout
    ? 'nicht angemeldet'
    : 'n.a.'
  const loginTitle = username ? 'abmelden' : 'anmelden'
  const objektName = get(data, 'objectById.name')
  const pCName = get(data, 'propertyCollectionById.name')
  const taxName = get(data, 'taxonomyById.name')

  const onClickColumnButtonData = useCallback(() => {
    history.push('/')
  }, [history])
  const onClickColumnButtonExport = useCallback(() => {
    history.push('/Export')
  }, [history])
  const onClickColumnButtonLogin = useCallback(() => {
    history.push('/Login')
  }, [history])
  const onClickShare = useCallback(() => {
    const name = pCName
      ? pCName
      : objektName
      ? `${taxName}: ${objektName}`
      : taxName
      ? taxName
      : url0
      ? url0
      : ''
    const title = `arteigenschaften.ch${!!name ? ': ' : ''}${name}`
    navigator.share({
      title,
      url: window.location.href,
    })
  }, [pCName, objektName, taxName, url0])

  const setLayout = useCallback(() => {
    // should do this by comparing scrollWidth with clientWidth
    // if clientWidth < scrollWidth then div is overflowing
    // BUT: every second measurement gives clientWidth === scrollWidth,
    // even when absolutely wrong
    const toolbarCWidth = toolbarC.current ? toolbarC.current.clientWidth : 0
    const datenCWidth = datenC.current ? datenC.current.offsetWidth : 0
    const exportCWidth = exportC.current ? exportC.current.offsetWidth : 0
    const loginCWidth = loginC.current ? loginC.current.offsetWidth : 0
    const moreCWidth = moreC.current ? moreC.current.offsetWidth : 0
    const shareCWidth = shareC.current ? shareC.current.offsetWidth : 0
    const totalWidth =
      datenCWidth + exportCWidth + loginCWidth + moreCWidth + shareCWidth
    let shouldLayoutWide = toolbarCWidth - totalWidth > 260
    // need to set narrow to wide later to prevent jumping between
    if (!wideLayout) shouldLayoutWide = toolbarCWidth - totalWidth > 400
    if (shouldLayoutWide !== wideLayout) {
      setWideLayout(shouldLayoutWide)
    }
  }, [wideLayout, toolbarC, datenC, exportC, loginC, moreC, shareC])

  useEffect(() => {
    window.addEventListener('resize', debounce(setLayout, 200))
    setTimeout(() => setLayout(), 100)
    return () => window.removeEventListener('resize', debounce(setLayout, 200))
  })

  if (dataError) return `Error fetching data: ${dataError.message}`

  return (
    <ErrorBoundary>
      <Container>
        <StyledAppBar position="static">
          <div ref={toolbarC}>
            <StyledToolbar>
              <StyledTypography variant="h6" color="inherit">
                {wideLayout ? 'Arteigenschaften' : ''}
              </StyledTypography>
              <div ref={datenC}>
                <StyledButton
                  data-active={[
                    undefined,
                    'arten',
                    'lebensräume',
                    'eigenschaften-sammlungen',
                    'benutzer',
                    'organisationen',
                  ].includes(url0)}
                  onClick={onClickColumnButtonData}
                >
                  Daten
                </StyledButton>
              </div>
              <div ref={exportC}>
                <StyledButton
                  data-active={url0 === 'export'}
                  onClick={onClickColumnButtonExport}
                >
                  Export
                </StyledButton>
              </div>
              <div ref={loginC}>
                <LoginButton
                  data-active={url0 === 'login'}
                  data-widelayout={wideLayout}
                  onClick={onClickColumnButtonLogin}
                  title={loginTitle}
                >
                  {loginLabel}
                </LoginButton>
              </div>
              {navigator.share !== undefined && (
                <div ref={shareC}>
                  <ShareButton aria-label="teilen" onClick={onClickShare}>
                    <Icon>
                      <StyledMoreVertIcon />
                    </Icon>
                  </ShareButton>
                </div>
              )}
              <Suspense fallback={<LazyImportFallback />}>
                <div ref={moreC}>
                  <MoreMenu />
                </div>
              </Suspense>
            </StyledToolbar>
          </div>
        </StyledAppBar>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(MyAppBar)
