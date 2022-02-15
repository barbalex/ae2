import React, { useEffect, useCallback, useContext, useMemo } from 'react'
import styled from 'styled-components'
import { FaSearch } from 'react-icons/fa'
import Highlighter from 'react-highlight-words'
import Select from 'react-select/async'
import { useQuery, gql, useApolloClient } from '@apollo/client'
import { observer } from 'mobx-react-lite'
import { navigate } from 'gatsby'
import { useDebouncedCallback } from 'use-debounce'

import getUrlForObject from '../../../modules/getUrlForObject'
import storeContext from '../../../storeContext'
import ErrorBoundary from '../../shared/ErrorBoundary'
import buildOptions from './buildOptions'
import getConstants from '../../../modules/constants'

const constants = getConstants()

const Container = styled.div`
  flex: 0 1 auto;
  padding: 0;
  display: flex;
  justify-content: space-between;
`
const StyledSelect = styled(Select)`
  width: 100%;
  .react-select__control:hover {
    background-color: #ffcc80 !important !important;
  }
  .react-select__control:focus-within {
    background-color: #ffcc80 !important !important;
    box-shadow: none;
  }
  .react-select__option--is-focused {
    background-color: rgba(74, 20, 140, 0.1) !important;
  }
`

const SearchIcon = styled(FaSearch)`
  margin: auto 5px;
  margin-right: -25px;
  z-index: 1;
  color: rgba(0, 0, 0, 0.8);
  font-weight: 300;
`

const noOptionsMessage = () => null
const loadingMessage = () => null
const formatOptionLabel = ({ label }, { inputValue }) => (
  <Highlighter searchWords={[inputValue]} textToHighlight={label} />
)
const formatGroupLabel = (data) => <div>{data.label}</div>

const objectUrlQuery = gql`
  query objectUrlDataQuery($treeFilterId: UUID!, $run: Boolean!) {
    objectById(id: $treeFilterId) @include(if: $run) {
      id
      objectByParentId {
        id
        objectByParentId {
          id
          objectByParentId {
            id
            objectByParentId {
              id
              objectByParentId {
                id
                objectByParentId {
                  id
                }
              }
            }
          }
        }
      }
      taxonomyByTaxonomyId {
        id
        type
        name
      }
    }
  }
`

const TreeFilter = () => {
  // TODO: use local state instead of mobx for label, id
  const client = useApolloClient()
  const store = useContext(storeContext)
  const { treeFilter } = store
  const { setTreeFilter } = treeFilter

  const treeFilterId = treeFilter.id ?? '99999999-9999-9999-9999-999999999999'
  const { data: objectUrlData } = useQuery(objectUrlQuery, {
    variables: {
      treeFilterId,
      run: !!treeFilter.id,
    },
  })

  const onInputChange = useCallback(
    (option) => {
      if (!option) return
      setTreeFilter({ text: option, id: treeFilterId })
    },
    [setTreeFilter, treeFilterId],
  )
  const onChange = useCallback(
    (option) => {
      if (!option) return
      switch (option.type) {
        case 'pC':
          navigate(`/Eigenschaften-Sammlungen/${option.val}`)
          break
        case 'art':
        case 'lr':
        default: {
          /**
           * set treeFilterId
           * then app rerenders
           * effect finds treeFilterId
           * and result of objectUrlData query
           * passes it to getUrlForObject
           * mutates history
           */
          setTreeFilter({ id: option.val, text: option.label })
        }
      }
    },
    [setTreeFilter],
  )

  useEffect(() => {
    const urlObject = objectUrlData?.objectById ?? {}
    /**
     * check if treeFilterId and urlObject exist
     * if true:
     * pass query result for objectUrlData to getUrlForObject()
     * then update history with that result
     * and reset treeFilter, id and text
     */
    if (
      treeFilterId &&
      treeFilterId !== '99999999-9999-9999-9999-999999999999' &&
      urlObject &&
      urlObject.id
    ) {
      const url = getUrlForObject(urlObject)
      navigate(`/${url.join('/')}`)
      setTreeFilter({ id: null, text: '' })
    }
  }, [treeFilterId, setTreeFilter, objectUrlData?.objectById])

  const buildOptionsDebounced = useDebouncedCallback(({ cb, val }) => {
    buildOptions({ client, treeFilter, cb, val })
  }, 600)
  const loadOptions = useCallback(
    (val, cb) => {
      buildOptionsDebounced({ cb, val })
    },
    [buildOptionsDebounced],
  )

  // TODO: replace with real value
  const singleColumnView = false

  const customStyles = useMemo(
    () => ({
      control: (provided) => ({
        ...provided,
        border: 'none',
        borderRadius: '3px',
        backgroundColor: '#FFCC8042',
        marginLeft: 0,
        paddingLeft: singleColumnView ? '2px' : '25px',
      }),
      valueContainer: (provided) => ({
        ...provided,
        borderRadius: '3px',
        paddingLeft: 0,
      }),
      singleValue: (provided) => ({
        ...provided,
        color: 'rgba(0,0,0,0.8)',
      }),
      option: (provided) => ({
        ...provided,
        color: 'rgba(0,0,0,0.8)',
        fontSize: '0.8em',
        paddingTop: '5px',
        paddingBottom: '5px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }),
      groupHeading: (provided) => ({
        ...provided,
        lineHeight: '1em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: 'rgba(0, 0, 0, 0.8)',
        fontWeight: '700',
        userSelect: 'none',
        textTransform: 'none',
      }),
      input: (provided) => ({
        ...provided,
        color: 'rgba(0, 0, 0, 0.8)',
      }),
      menuList: (provided) => ({
        ...provided,
        maxHeight: `calc(100vh - ${constants.appBarHeight}px - 39px)`,
        '::-webkit-scrollbar': {
          width: '6px',
        },
        '::-webkit-scrollbar-thumb': {
          borderRadius: '4px',
          boxShadow: 'inset 0 0 7px #e65100',
          background: 'rgba(85, 85, 85, 0.05)',
        },
        '::-webkit-scrollbar-track': {
          background: 'rgba(0, 0, 0, 0) !important',
          borderRadius: '1rem',
        },
        // '::-webkit-scrollbar-thumb:hover': {
        //   background: '#6B2500',
        // },
      }),
      menu: (provided) => ({
        ...provided,
        width: 'auto',
        maxWidth: '100%',
        marginTop: 0,
      }),
      placeholder: (provided) => ({
        ...provided,
        color: 'rgba(0,0,0,0.4)',
      }),
      indicatorSeparator: (provided) => ({
        ...provided,
        display: 'none',
      }),
      dropdownIndicator: (provided) => ({
        ...provided,
        display: 'none',
      }),
      clearIndicator: (provided) => ({
        ...provided,
        color: 'rgba(0,0,0,0.8)',
      }),
    }),
    [singleColumnView],
  )

  return (
    <ErrorBoundary>
      <Container>
        <SearchIcon />
        <StyledSelect
          styles={customStyles}
          onInputChange={onInputChange}
          onChange={onChange}
          formatGroupLabel={formatGroupLabel}
          formatOptionLabel={formatOptionLabel}
          placeholder="suchen"
          noOptionsMessage={noOptionsMessage}
          loadingMessage={loadingMessage}
          classNamePrefix="react-select"
          loadOptions={loadOptions}
          isClearable
          spellCheck={false}
        />
      </Container>
    </ErrorBoundary>
  )
}

export default observer(TreeFilter)
