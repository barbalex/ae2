import React, {
  useEffect,
  useCallback,
  useState,
  useMemo,
  useContext,
} from 'react'
import Autosuggest from 'react-autosuggest'
import match from 'autosuggest-highlight/match'
import parse from 'autosuggest-highlight/parse'
import TextField from '@mui/material/TextField'
import Paper from '@mui/material/Paper'
import MenuItem from '@mui/material/MenuItem'
import styled from 'styled-components'
import trimStart from 'lodash/trimStart'
import { useQuery, gql } from '@apollo/client'
import { observer } from 'mobx-react-lite'

import readableType from '../../../../../../modules/readableType'
import storeContext from '../../../../../../storeContext'

// somehow need container and style Autosuggest to get css to work well
const Container = styled.div`
  flex-grow: 1;
  .react-autosuggest__container {
    width: 100%;
  }
  .react-autosuggest__suggestions-list {
    margin: 0;
    padding: 0;
    list-style-type: none;
    max-height: 500px;
    overflow: auto;
  }
  .react-autosuggest__suggestion {
    display: block;
    cursor: pointer;
    margin: 0;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
  }
`
const StyledAutosuggest = styled(Autosuggest)`
  .react-autosuggest__suggestions-container {
    position: relative;
    height: 200px;
  }
  .react-autosuggest__suggestions-container--open {
    position: absolute;
    margin-top: 8px;
    margin-bottom: 24px;
    left: 0;
    right: 0;
    // minWidth: that of parent
    min-width: ${(props) => props['data-width']}px;
  }
`

const StyledPaper = styled(Paper)`
  z-index: 1;
  /* need this so text is visible when overflowing */
  > ul > li > div {
    overflow: inherit;
  }
`
const StyledTextField = styled(TextField)`
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  width: 100%;
`

function renderSuggestion(suggestion, { query, isHighlighted }) {
  const matches = match(suggestion, query)
  const parts = parse(suggestion, matches)

  return (
    <MenuItem selected={isHighlighted} component="div">
      <>
        {parts.map((part, index) => {
          return part.highlight ? (
            <strong key={String(index)} style={{ fontWeight: 700 }}>
              {part.text}
            </strong>
          ) : (
            <span key={String(index)} style={{ fontWeight: 400 }}>
              {part.text}
            </span>
          )
        })}
      </>
    </MenuItem>
  )
}

function renderSuggestionsContainer(options) {
  const { containerProps, children } = options

  return (
    <StyledPaper {...containerProps} square>
      {children}
    </StyledPaper>
  )
}

function getSuggestionValue(suggestion) {
  return suggestion
}

function shouldRenderSuggestions() {
  return true
}

const taxFieldPropQuery = gql`
  query propDataQuery(
    $tableName: String!
    $propName: String!
    $pcFieldName: String!
    $pcTableName: String!
    $pcName: String!
    $fetchData: Boolean!
  ) {
    propValuesFunction(
      tableName: $tableName
      propName: $propName
      pcFieldName: $pcFieldName
      pcTableName: $pcTableName
      pcName: $pcName
    ) @include(if: $fetchData) {
      nodes {
        value
      }
    }
  }
`

const IntegrationAutosuggest = ({
  taxname,
  pname,
  jsontype,
  comparator,
  value: propsValue,
  width,
}) => {
  const store = useContext(storeContext)
  const { addFilterFields, addTaxProperty, setTaxFilters } = store.export

  const [fetchData, setFetchData] = useState(false)
  const [dataFetched, setDataFetched] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [propValues, setPropValues] = useState([])
  const [value, setValue] = useState(propsValue || '')

  // console.log('TaxFieldValue', { propValues, suggestions, dataFetched, value })

  const { data: propData, error: propDataError } = useQuery(taxFieldPropQuery, {
    variables: {
      tableName: 'object',
      propName: pname,
      pcFieldName: 'taxonomy_id',
      pcTableName: 'taxonomy',
      pcName: taxname,
      fetchData,
    },
  })

  useEffect(() => {
    if (fetchData && !dataFetched) {
      const propValues = (propData?.propValuesFunction?.nodes ?? [])
        .filter((v) => v !== null && v !== undefined)
        .map((v) => v.value)
      if (propValues.length > 0) {
        setPropValues(propValues)
        setFetchData(false)
        setDataFetched(true)
      }
    }
  }, [fetchData, dataFetched, propData])

  const getSuggestions = useCallback(
    (value) => {
      const inputValue = value.toLowerCase()

      if (value === ' ') return propValues
      if (inputValue.length === 0) return []
      return propValues.filter((v) => v.toLowerCase().includes(inputValue))
    },
    [propValues],
  )

  const handleSuggestionsFetchRequested = useCallback(
    ({ value }) => {
      setSuggestions(getSuggestions(value))
    },
    [getSuggestions],
  )

  const handleSuggestionsClearRequested = useCallback(() => {
    setSuggestions([])
  }, [])

  const onFocus = useCallback(() => {
    // fetch data if not yet happened
    if (!dataFetched) setFetchData(true)
  }, [dataFetched])

  const handleChange = useCallback((event, { newValue }) => {
    // trim the start to enable entering space
    // at start to open list
    setValue(trimStart(newValue))
  }, [])

  const handleBlur = useCallback(() => {
    // 1. change filter value
    let comparatorValue = comparator
    if (!comparator && value) comparatorValue = 'ILIKE'
    if (!value) comparatorValue = null
    setTaxFilters({
      taxname,
      pname,
      comparator: comparatorValue,
      value,
    })
    // 2. if value and field not choosen, choose it
    if (addFilterFields && value) {
      addTaxProperty({ taxname, pname })
    }
  }, [
    comparator,
    value,
    setTaxFilters,
    taxname,
    pname,
    addFilterFields,
    addTaxProperty,
  ])

  const renderInput = useCallback(
    (inputProps) => {
      const labelText = `${pname} (${readableType(jsontype)})`
      // eslint-disable-next-line no-unused-vars
      const { autoFocus, ref, ...other } = inputProps

      return (
        <StyledTextField
          label={labelText}
          fullWidth
          value={value || ''}
          inputRef={ref}
          variant="standard"
          InputProps={other}
        />
      )
    },
    [pname, jsontype, value],
  )
  const inputProps = useMemo(
    () => ({
      value,
      autoFocus: true,
      placeholder: 'Für Auswahlliste: Leerschlag tippen',
      onChange: handleChange,
      onBlur: handleBlur,
      onFocus: onFocus,
    }),
    [handleBlur, handleChange, onFocus, value],
  )

  if (propDataError) {
    return `Error loading data: ${propDataError.message}`
  }

  // console.log('TaxField, width:', width)

  return (
    <Container>
      <StyledAutosuggest
        renderInputComponent={renderInput}
        suggestions={suggestions}
        onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
        onSuggestionsClearRequested={handleSuggestionsClearRequested}
        renderSuggestionsContainer={renderSuggestionsContainer}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        shouldRenderSuggestions={shouldRenderSuggestions}
        inputProps={inputProps}
        data-width={width}
        className="styled_autossuggest"
      />
    </Container>
  )
}

export default observer(IntegrationAutosuggest)
