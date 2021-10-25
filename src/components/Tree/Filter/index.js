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
import mobxStoreContext from '../../../mobxStoreContext'
import ErrorBoundary from '../../shared/ErrorBoundary'
import buildOptions from './buildOptions'

const Container = styled.div`
  padding: 5px 16px 0 13px;
  display: flex;
  justify-content: space-between;
  .react-autosuggest__container {
    width: 100%;
    border-bottom: 1px solid #c6c6c6;
  }
  .react-autosuggest__input {
    width: 100%;
    border: none;
    font-size: 16px;
    padding: 5px;
    background-color: rgba(0, 0, 0, 0);
  }
  .react-autosuggest__input--focused {
    outline: none;
  }
  .react-autosuggest__input--open {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
  .react-autosuggest__suggestions-container {
    display: none;
  }
  .react-autosuggest__suggestions-container--open {
    display: block;
    position: absolute;
    top: 32px;
    width: ${(props) => `${props['data-ownwidth']}px`};
    border: 1px solid #aaa;
    background-color: #fff;
    font-family: Helvetica, sans-serif;
    /*font-weight: 300;*/
    font-size: 14px;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    z-index: 2;
  }
  .react-autosuggest__suggestions-list {
    margin: 0;
    padding: 0;
    list-style-type: none;
  }
  .react-autosuggest__suggestion {
    cursor: pointer;
    padding: 5px 20px;
    margin-top: 0;
    margin-bottom: 0;
  }
  .react-autosuggest__suggestion--highlighted {
    background-color: #ddd;
  }
  .react-autosuggest__section-container {
    border-top: 1px dashed #ccc;
  }
  .react-autosuggest__section-container--first {
    border-top: 0;
  }
  .react-autosuggest__section-title {
    padding: 5px 0 5px 10px;
    font-size: 12px;
    color: #777;
  }
`
const StyledSelect = styled(Select)`
  width: 100%;
  .react-select__control:hover {
    background-color: #ddd !important;
  }
  .react-select__control:focus-within {
    background-color: #ddd !important;
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

const TreeFilter = ({ dimensions }) => {
  const client = useApolloClient()
  const mobxStore = useContext(mobxStoreContext)
  const { treeFilter } = mobxStore
  const treeFilterText = treeFilter.text
  const { setTreeFilter } = treeFilter

  const treeFilterId = treeFilter.id ?? '99999999-9999-9999-9999-999999999999'
  const { data: objectUrlData, error: objectUrlError } = useQuery(
    objectUrlQuery,
    {
      variables: {
        treeFilterId,
        run: !!treeFilter.id,
      },
    },
  )

  const urlObject = objectUrlData?.objectById ?? {}

  const onInputChange = useCallback(
    (option) => {
      console.log('onChange, option:', option)
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
           * componentDidUpdate finds treeFilterId
           * and result of objectUrlData query
           * passes it to getUrlForObject
           * mutates history
           */
          setTreeFilter({ id: option.val, text: option.label })
        }
      }
    },
    [setTreeFilter, treeFilterText],
  )

  useEffect(() => {
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
  }, [urlObject, treeFilterId, setTreeFilter])

  // on first render dimensions.width is passed as '100%'
  // later it is passed as number of pixels
  const ownWidth = isNaN(dimensions.width) ? 380 : dimensions.width - 29

  const renderSectionTitle = useCallback(
    (section) => <strong>{section.title}</strong>,
    [],
  )

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
        backgroundColor: 'rgba(0, 0, 0, 0)',
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
        color: '#ac87d0',
      }),
      option: (provided) => ({
        ...provided,
        color: 'rgba(0,0,0,0.8)',
        fontSize: '0.8em',
        paddingTop: '3px',
        paddingBottom: '3px',
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
        color: 'white',
      }),
      menuList: (provided) => ({
        ...provided,
        maxHeight: 'calc(100vh - 60px)',
      }),
      menu: (provided) => ({
        ...provided,
        maxHeight: 'calc(100vh - 60px)',
        width: 'auto',
        maxWidth: ownWidth,
        marginTop: 0,
      }),
      placeholder: (provided) => ({
        ...provided,
        color: '#ac87d0',
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
        color: '#ac87d0',
      }),
    }),
    [ownWidth, singleColumnView],
  )

  return (
    <ErrorBoundary>
      <Container data-ownwidth={ownWidth}>
        <SearchIcon />
        <StyledSelect
          styles={customStyles}
          onInputChange={onInputChange}
          onChange={onChange}
          formatGroupLabel={renderSectionTitle}
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
