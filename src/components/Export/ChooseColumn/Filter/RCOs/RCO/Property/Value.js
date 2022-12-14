import React, { useState, useCallback, useContext, useRef } from 'react'
import Select from 'react-select/async'
import Highlighter from 'react-highlight-words'
import styled from '@emotion/styled'
import { gql, useApolloClient } from '@apollo/client'
import { observer } from 'mobx-react-lite'

import readableType from '../../../../../../../modules/readableType'
import storeContext from '../../../../../../../storeContext'

const Container = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
`
const Label = styled.div`
  font-size: 12px;
  color: rgb(0, 0, 0, 0.54);
`
const StyledSelect = styled(Select)`
  width: 100%;
  .react-select__control {
    border-bottom: 1px solid;
    background-color: rgba(0, 0, 0, 0) !important;
    border-bottom-color: rgba(0, 0, 0, 0.3);
    border-top: none;
    border-left: none;
    border-right: none;
    border-radius: 0;
    padding-left: 0 !important;
  }
  .react-select__value-container {
    padding-left: 0 !important;
  }
  .react-select__control:hover {
    border-bottom-width: 2px;
  }
  .react-select__control:focus-within {
    border-bottom-color: rgba(230, 81, 0, 0.6) !important;
    box-shadow: none;
  }
  .react-select__input-container {
    padding-left: 0;
  }
  .react-select__option {
    font-size: small;
  }
  .react-select__menu {
    /* z-index: 9999; */
    position: unset;
  }
  .react-select__menu,
  .react-select__menu-list {
    height: 130px;
    height: ${(props) => (props.maxheight ? `${props.maxheight}px` : 'unset')};
  }
  .react-select__indicator {
    color: rgba(0, 0, 0, 0.4);
  }
`

const rcoFieldPropQuery = gql`
  query propDataQuery(
    $tableName: String!
    $propName: String!
    $pcFieldName: String!
    $pcTableName: String!
    $pcName: String!
    $propValue: String!
  ) {
    propValuesFilteredFunction(
      tableName: $tableName
      propName: $propName
      pcFieldName: $pcFieldName
      pcTableName: $pcTableName
      pcName: $pcName
      propValue: $propValue
    ) {
      nodes {
        value
      }
    }
  }
`

const noOptionsMessage = () => 'Keine Daten entsprechen dem Filter'
const loadingMessage = () => 'lade...'
// react-highlight-words crashes when passing some chars
const removeBadChars = (str) => str.replaceAll('(', '').replaceAll(')', '')
const formatOptionLabel = ({ label }, { inputValue }) => (
  <Highlighter
    searchWords={[removeBadChars(inputValue)]}
    textToHighlight={label}
  />
)

const IntegrationAutosuggest = ({
  relationtype,
  pcname,
  pname,
  jsontype,
  comparator,
  value: propValue,
  width,
}) => {
  const client = useApolloClient()
  const store = useContext(storeContext)
  const { addFilterFields, setRcoFilters, addRcoProperty } = store.export

  // Problem with loading data
  // Want to load all data when user focuses on input
  // But is not possible to programmatically call loadOptions (https://github.com/JedWatson/react-select/discussions/5389#discussioncomment-3911824)
  // So need to set key on Select and update it on focus
  // Maybe better to not use AsyncSelect? https://github.com/JedWatson/react-select/discussions/5389#discussioncomment-3911837
  const ref = useRef()
  const [focusCount, setFocusCount] = useState(0)

  const [value, setValue] = useState(propValue || '')
  const [error, setError] = useState(undefined)

  const loadOptions = useCallback(
    async (val) => {
      console.log('loadOptions', { val })
      if (!focusCount) return []
      const { data, error } = await client.query({
        query: rcoFieldPropQuery,
        variables: {
          tableName: 'relation',
          propName: pname,
          pcFieldName: 'property_collection_id',
          pcTableName: 'property_collection',
          pcName: pcname,
          propValue: val ?? '',
        },
      })
      console.log('loadOptions', { data, error })
      const returnData = data?.propValuesFilteredFunction?.nodes?.map((n) => ({
        value: n.value,
        label: n.value,
      }))
      setValue(val)
      setError(error)
      return returnData
    },
    [client, focusCount, pcname, pname],
  )

  const onBlur = useCallback(() => setFilter(value), [setFilter, value])

  const onChange = useCallback(
    (newValue, actionMeta) => {
      // console.log('onChange', { newValue, actionMeta })
      let value
      switch (actionMeta.action) {
        case 'clear':
          value = ''
          break
        default:
          value = newValue?.value
          break
      }
      setValue(value)
      setFilter(value)
    },
    [setFilter],
  )

  const setFilter = useCallback(
    (val) => {
      // 1. change filter value
      let comparatorValue = comparator
      if (!comparator && val) comparatorValue = 'ILIKE'
      if (!val) comparatorValue = null
      setRcoFilters({
        pcname,
        relationtype,
        pname,
        comparator: comparatorValue,
        value: val,
      })
      // 2. if value and field not choosen, choose it
      if (addFilterFields && value) {
        addRcoProperty({ pcname, relationtype, pname })
      }
    },
    [
      addFilterFields,
      addRcoProperty,
      comparator,
      pcname,
      pname,
      relationtype,
      setRcoFilters,
      value,
    ],
  )

  if (error) {
    return `Error loading data: ${error.message}`
  }

  const valueToShow = value ? { value, label: value } : undefined

  return (
    <Container>
      <Label>{`${pname} (${readableType(jsontype)})`}</Label>
      <StyledSelect
        key={focusCount}
        ref={ref}
        value={valueToShow}
        defaultOptions={true}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={() => {
          if (focusCount === 0) {
            setFocusCount(1)
            setTimeout(() => {
              ref.current.onMenuOpen()
              ref.current.focus()
            })
          }
        }}
        formatOptionLabel={formatOptionLabel}
        placeholder={''}
        noOptionsMessage={noOptionsMessage}
        loadingMessage={loadingMessage}
        classNamePrefix="react-select"
        loadOptions={loadOptions}
        cacheOptions
        isClearable
        openMenuOnFocus={true}
        spellCheck={false}
        data-width={width}
      />
    </Container>
  )
}

export default observer(IntegrationAutosuggest)
