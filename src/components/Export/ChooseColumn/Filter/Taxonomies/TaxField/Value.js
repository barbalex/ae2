import React, {
  useEffect,
  useCallback,
  useState,
  useMemo,
  useContext,
  useRef,
} from 'react'
import Autosuggest from 'react-autosuggest'
import Select from 'react-select/async'
import Highlighter from 'react-highlight-words'
import match from 'autosuggest-highlight/match'
import parse from 'autosuggest-highlight/parse'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import Paper from '@mui/material/Paper'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import styled from 'styled-components'
import trimStart from 'lodash/trimStart'
import { useQuery, gql, useLazyQuery, useApolloClient } from '@apollo/client'
import { observer } from 'mobx-react-lite'
import { getSnapshot } from 'mobx-state-tree'

import readableType from '../../../../../../modules/readableType'
import storeContext from '../../../../../../storeContext'
import constants from '../../../../../../modules/constants'

// somehow need container and style Autosuggest to get css to work well
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
  .react-select__menu,
  .react-select__menu-list {
    height: 130px;
    height: ${(props) => (props.maxheight ? `${props.maxheight}px` : 'unset')};
  }
  .react-select__indicator {
    color: rgba(0, 0, 0, 0.4);
  }
`

const taxFieldPropQuery = gql`
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
const formatOptionLabel = ({ label }, { inputValue }) => (
  <Highlighter searchWords={[inputValue]} textToHighlight={label} />
)

const IntegrationAutosuggest = ({
  taxname,
  pname,
  jsontype,
  comparator,
  value: propsValue,
  width,
}) => {
  const client = useApolloClient()
  const store = useContext(storeContext)
  const {
    addFilterFields,
    addTaxProperty,
    setTaxFilters,
    taxFilters: taxFiltersPassed,
  } = store.export
  const taxFilters = getSnapshot(taxFiltersPassed)
  const taxFilter = taxFilters.find(
    (f) => f.taxname === taxname && f.pname === pname,
  )

  // Problem with loading data
  // Want to load all data when user focuses on input
  // But is not possible to programmatically call loadOptions (https://github.com/JedWatson/react-select/discussions/5389#discussioncomment-3911824)
  // So need to set key on Select and update it on focus
  // TODO: maybe better to not use AsyncSelect: https://github.com/JedWatson/react-select/discussions/5389#discussioncomment-3911837
  const ref = useRef()
  const [focusCount, setFocusCount] = useState(0)

  // console.log('TaxFieldValue', {
  //   pname,
  //   taxname,
  //   taxFilters,
  //   taxFilter,
  //   propsValue,
  // })

  const [value, setValue] = useState(propsValue ?? '')
  const [error, setError] = useState(undefined)

  const loadOptions = useCallback(
    async (val) => {
      if (!focusCount) return []
      const { data, error } = await client.query({
        query: taxFieldPropQuery,
        variables: {
          tableName: 'object',
          propName: pname,
          pcFieldName: 'taxonomy_id',
          pcTableName: 'taxonomy',
          pcName: taxname,
          propValue: val ?? '',
        },
      })
      const returnData = data?.propValuesFilteredFunction?.nodes?.map((n) => ({
        value: n.value,
        label: n.value,
      }))
      setValue(val)
      setError(error)
      return returnData
    },
    [focusCount],
  )

  const onBlur = useCallback(() => setFilter(value), [value])

  const onChange = useCallback((newValue, actionMeta) => {
    console.log('onChange', { newValue, actionMeta })
    let value
    switch (actionMeta.action) {
      case 'clear':
        value = ''
        break
      default:
        value = newValue?.value
        break
    }
    setValue(newValue?.value)
    setFilter(newValue?.value)
  }, [])

  const setFilter = useCallback(
    (val) => {
      // 1. change filter value
      let comparatorValue = comparator
      if (!comparator && val) comparatorValue = 'ILIKE'
      if (!val) comparatorValue = null
      setTaxFilters({
        taxname,
        pname,
        comparator: comparatorValue,
        value: val,
      })
      // 2. if value and field not choosen, choose it
      if (addFilterFields && val) {
        addTaxProperty({ taxname, pname })
      }
    },
    [
      comparator,
      setTaxFilters,
      taxname,
      pname,
      addFilterFields,
      addTaxProperty,
    ],
  )

  if (error) {
    return `Error loading data: ${error.message}`
  }

  // TODO: use https://github.com/JedWatson/react-select/discussions/5389#discussioncomment-3911837 to enable loading all on focus
  return (
    <Container>
      <Label>{`${pname} (${readableType(jsontype)})`}</Label>
      <StyledSelect
        key={focusCount}
        ref={ref}
        value={value ? { value, label: value } : undefined}
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
        isFocused
        openMenuOnFocus={true}
        spellCheck={false}
        data-width={width}
      />
    </Container>
  )
}

export default observer(IntegrationAutosuggest)
