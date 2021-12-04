import React, { useCallback, useContext } from 'react'
import styled from 'styled-components'
import {
  MdExpandMore as ExpandMoreIcon,
  MdMoreHoriz as MoreHorizIcon,
  MdChevronRight as ChevronRightIcon,
  //MdRefresh as LoadingIcon,
  MdHourglassEmpty as LoadingIcon,
} from 'react-icons/md'
import Icon from '@mui/material/Icon'
import isEqual from 'lodash/isEqual'
import { useApolloClient } from '@apollo/client'
import { observer } from 'mobx-react-lite'
import { navigate } from 'gatsby'
import { getSnapshot } from 'mobx-state-tree'

import { ContextMenuTrigger } from '../../../modules/react-contextmenu'
import isUrlInActiveNodePath from '../../../modules/isUrlInActiveNodePath'
import onClickContextMenuDo from './onClickContextMenu'
import storeContext from '../../../storeContext'
import ErrorBoundary from '../../shared/ErrorBoundary'

const singleRowHeight = 23
const StyledNode = styled.div`
  padding-left: ${(props) => `${Number(props['data-level']) * 17 - 17}px`};
  height: ${singleRowHeight}px;
  max-height: ${singleRowHeight}px;
  box-sizing: border-box;
  margin: 0;
  display: flex;
  flex-direction: row;
  white-space: nowrap;
  user-select: none;
  cursor: pointer;
  color: ${(props) =>
    props['data-nodeisinactivenodepath'] ? '#D84315' : 'inherit'};
  &:hover {
    color: #f57c00 !important;
  }
`
const SymbolIcon = styled(Icon)`
  margin-top: ${(props) =>
    props['data-nodeisinactivenodepath']
      ? '-5px !important'
      : '-2px !important'};
  padding-left: ${(props) =>
    props['data-nodeisinactivenodepath'] ? '2px' : '2px'};
  font-size: ${(props) =>
    props['data-nodeisinactivenodepath']
      ? '26px !important'
      : '22px !important'};
  font-weight: ${(props) =>
    props['data-nodeisinactivenodepath'] ? '700 !important' : 'inherit'};
  color: ${(props) =>
    props['data-nodeisinactivenodepath'] ? '#D84315 !important' : 'inherit'};
  width: 26px;
  &:hover {
    color: #f57c00 !important;
  }
`
const SymbolSpan = styled.span`
  padding-right: 8px !important;
  padding-left: ${(props) =>
    props['data-nodeisinactivenodepath'] ? '8px' : '9px'};
  font-weight: ${(props) =>
    props['data-nodeisinactivenodepath'] ? '700 !important' : 'inherit'};
  margin-top: ${(props) =>
    props['data-nodeisinactivenodepath'] ? '-9px' : '-9px'};
  font-size: 28px !important;
  width: 26px;
`
const TextSpan = styled.span`
  margin-left: 0;
  font-size: 16px !important;
  font-weight: ${(props) =>
    props['data-nodeisinactivenodepath'] ? '700 !important' : 'inherit'};
`
const InfoSpan = styled.span`
  margin-left: 5px;
  font-size: 12px !important;
  line-height: 23px;
`

function collect(props) {
  return props
}

const Row = ({
  index = 0,
  style,
  data,
  userId,
  loading,
  setLoading,
  setOpen,
}) => {
  const client = useApolloClient()
  const store = useContext(storeContext)
  const activeNodeArray = getSnapshot(store.activeNodeArray)

  const nodeIsInActiveNodePath = isUrlInActiveNodePath(
    data.url,
    activeNodeArray,
  )
  // build symbols
  let useSymbolIcon = true
  let useSymbolSpan = false
  let symbol
  if (loading) {
    symbol = 'Loading'
  } else if (data.childrenCount && nodeIsInActiveNodePath) {
    symbol = 'ExpandMore'
  } else if (data.childrenCount) {
    symbol = 'ChevronRight'
  } else if (data.label === 'lade Daten') {
    symbol = 'MoreHoriz'
  } else {
    useSymbolSpan = true
    useSymbolIcon = false
  }
  const { url } = data
  const level = url?.length ?? 0

  const onClickNode = useCallback(async () => {
    // do nothing when loading indicator is clicked
    if (loading) return
    // or if node is already active
    if (!isEqual(url, activeNodeArray)) {
      setLoading(true)
      await data.fetch()
      await setOpen(true)
      setLoading(false)
      // TODO: navigate makes Tree rerender and loose it's state
      //navigate(`/${url.join('/')}`)
    }
  }, [loading, url, activeNodeArray, setLoading, data, setOpen])
  const onClickExpandMore = useCallback(
    (event) => {
      // do nothing when loading indicator is clicked
      if (loading) return
      if (isEqual(url, activeNodeArray)) {
        // close node if its expand more symbol was clicked
        const newUrl = [...url]
        newUrl.pop()
        navigate(`/${newUrl.join('/')}`)
        // prevent onClick on node
        event.preventDefault()
      }
    },
    [loading, url, activeNodeArray],
  )
  const onClickContextMenu = useCallback(
    (e, data, target) => {
      onClickContextMenuDo({
        e,
        data,
        target,
        client,
        // TODO: check this behaviour
        treeRefetch: () => {},
        userId,
        store,
      })
    },
    [client, userId, store],
  )

  //console.log('Row, node:', node)

  return (
    <div key={index} style={style}>
      <ErrorBoundary>
        <ContextMenuTrigger
          id={data.menuType}
          collect={collect}
          nodeId={data.id}
          nodeLabel={data.label}
          key={data.id}
          onItemClick={onClickContextMenu}
        >
          <StyledNode
            data-level={level}
            data-nodeisinactivenodepath={nodeIsInActiveNodePath}
            data-id={data.id}
            data-url={data.url}
            onClick={onClickNode}
          >
            {useSymbolIcon && (
              <SymbolIcon
                id="symbol"
                data-nodeisinactivenodepath={nodeIsInActiveNodePath}
                className="material-icons"
              >
                {symbol === 'Loading' && <LoadingIcon />}
                {symbol === 'ExpandMore' && (
                  <ExpandMoreIcon onClick={onClickExpandMore} />
                )}
                {symbol === 'ChevronRight' && <ChevronRightIcon />}
                {symbol === 'MoreHoriz' && <MoreHorizIcon />}
              </SymbolIcon>
            )}
            {useSymbolSpan && (
              <SymbolSpan data-nodeisinactivenodepath={nodeIsInActiveNodePath}>
                {'-'}
              </SymbolSpan>
            )}
            <TextSpan data-nodeisinactivenodepath={nodeIsInActiveNodePath}>
              {data.label}
            </TextSpan>
            <InfoSpan>{data.info || ''}</InfoSpan>
          </StyledNode>
        </ContextMenuTrigger>
      </ErrorBoundary>
    </div>
  )
}

export default observer(Row)
