// @flow
import React from 'react'
import styled from 'styled-components'
import compose from 'recompose/compose'
import withHandlers from 'recompose/withHandlers'
import Autosuggest from 'react-autosuggest'
import { withApollo } from 'react-apollo'
import app from 'ampersand-app'
import get from 'lodash/get'

import treeFilterMutation from '../modules/treeFilterMutation'
import treeFilterData from '../modules/treeFilterData'
import filterSuggestionsData from '../modules/filterSuggestionsData'
import getUrlForObject from '../modules/getUrlForObject'
import objectUrlData from '../modules/objectUrlData'

const Container = styled.div`
  padding: 5px 16px 0 13px;
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
    width: ${props => `${props['data-autosuggestwidth']}px`};
    border: 1px solid #aaa;
    background-color: #fff;
    font-family: Helvetica, sans-serif;
    font-weight: 300;
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

const enhance = compose(
  withApollo,
  treeFilterData,
  filterSuggestionsData,
  objectUrlData,
  withHandlers({
    onChange: ({ client, treeFilterData }) => (event, { newValue }) => {
      const { id } = treeFilterData.treeFilter
      client.mutate({
        mutation: treeFilterMutation,
        variables: { text: newValue, id },
      })
    },
    onSuggestionSelected: ({ client, treeFilterData }) => (
      event,
      { suggestion }
    ) => {
      console.log('TreeFilter, onSuggestionSelected: suggestion:', suggestion)
      const text = get(treeFilterData, 'treeFilter.text', '')
      console.log('TreeFilter, onSuggestionSelected: text:', text)
      switch (suggestion.type) {
        case 'pC':
          app.history.push(`/Eigenschaften-Sammlungen/${suggestion.id}`)
          break
        case 'tO':
        default: {
          /**
           * TODO
           * set treeFilterId
           * then app rerenders
           * finds treeFilterId
           * gets result of objectUrlData query
           * passes it to getUrlForObject
           * mutates activeNodeArray
           */
          console.log('TreeFilter: mutating treeFilterId to:', suggestion.id)
          client.mutate({
            mutation: treeFilterMutation,
            variables: { id: suggestion.id, text },
          })
        }
      }
    },
  })
)

const TreeFilter = ({
  client,
  treeFilterData,
  filterSuggestionsData,
  objectUrlData,
  onChange,
  onSuggestionSelected,
  dimensions,
}: {
  client: Object,
  treeFilterData: Object,
  filterSuggestionsData: Object,
  objectUrlData: Object,
  onChange: () => {},
  onSuggestionSelected: () => {},
  dimensions: Object,
}) => {
  const urlObject = get(objectUrlData, 'objectById', {})
  console.log('TreeFilter: objectUrlData:', objectUrlData)
  console.log('TreeFilter: urlObject:', urlObject)
  const text = get(treeFilterData, 'treeFilter.text', '')
  const { filterSuggestionsTO, filterSuggestionsPC } = filterSuggestionsData
  const inputProps = {
    value: text || '',
    onChange,
    type: 'search',
    placeholder: 'suchen',
    spellCheck: false,
  }
  /**
   * need add type:
   * when suggestion is clicked,
   * url is calculated by id depending on type
   * CANNOT map from filterSuggestionsTO.nodes
   * as object is not extensible
   */
  const suggestionsTO = []
  if (filterSuggestionsTO && filterSuggestionsTO.nodes) {
    filterSuggestionsTO.nodes.forEach(s => {
      suggestionsTO.push({
        ...s,
        type: 't0',
      })
    })
  }
  const suggestionsPC = []
  if (filterSuggestionsPC && filterSuggestionsPC.nodes) {
    filterSuggestionsPC.nodes.forEach(s => {
      suggestionsPC.push({
        ...s,
        type: 'pC',
      })
    })
  }
  const suggestions = [
    {
      title: `Arten und Lebensräume (${suggestionsTO.length})`,
      suggestions: suggestionsTO,
    },
    {
      title: `Eigenschaften-Sammlungen (${suggestionsPC.length})`,
      suggestions: suggestionsPC,
    },
  ]
  // on first render dimensions.width is passed as '100%'
  // later it is passed as number of pixels
  const autosuggestWidth = isNaN(dimensions.width) ? 380 : dimensions.width - 29

  /**
   * TODO
   * check if treeFilterId exists
   * if true:
   * pass query result for objectUrlData to getUrlForObject()
   * then update activeNodeArray with that result
   * and reset treeFilterId
   */
  const treeFilterId =
    treeFilterData.treeFilter && treeFilterData.treeFilter.id
      ? treeFilterData.treeFilter.id
      : null
  const treeFilterText =
    treeFilterData.treeFilter && treeFilterData.treeFilter.text
      ? treeFilterData.treeFilter.text
      : null
  if (treeFilterId && treeFilterId !== '99999999-9999-9999-9999-999999999999') {
    const url = getUrlForObject(urlObject)
    app.history.push(`/${url.join('/')}`)
    console.log('App: does next step (treeFilterMutation) cause error?')
    client.mutate({
      mutation: treeFilterMutation,
      variables: { id: null, text: treeFilterText },
    })
    console.log('App: next step done')
  }

  return (
    <Container data-autosuggestwidth={autosuggestWidth}>
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={() => {
          // Autosuggest wants this function
          // could maybe be used to indicate loading?
          // console.log('fetch requested')
        }}
        onSuggestionsClearRequested={() => {
          // need this?
        }}
        getSuggestionValue={suggestion => suggestion && suggestion.name}
        onSuggestionSelected={onSuggestionSelected}
        renderSuggestion={suggestion => <span>{suggestion.name}</span>}
        multiSection={true}
        renderSectionTitle={section => <strong>{section.title}</strong>}
        getSectionSuggestions={section => section.suggestions}
        inputProps={inputProps}
        focusInputOnSuggestionClick={false}
      />
    </Container>
  )
}

export default enhance(TreeFilter)
