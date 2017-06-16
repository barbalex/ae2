// @flow
import React from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import styled from 'styled-components'
import compose from 'recompose/compose'
import withHandlers from 'recompose/withHandlers'
import Autosuggest from 'react-autosuggest'

const Container = styled.div`
  padding: 5px 13px 0 13px;
  .react-autosuggest__container {
    width: 100%;
    color: red;
  }
  .react-autosuggest__input {
    width: 100%;
    border-radius: 3px;
    font-size: 14px;
    padding: 5px;
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
    top: 51px;
    width: 280px;
    border: 1px solid #aaa;
    background-color: #fff;
    font-family: Helvetica, sans-serif;
    font-weight: 300;
    font-size: 16px;
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
    padding: 10px 20px;
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
    padding: 10px 0 0 10px;
    font-size: 12px;
    color: #777;
  }
`

const enhance = compose(
  inject('store'),
  withHandlers({
    onChange: props => (event, { newValue }) => {
      props.store.treeFilter.setText(newValue)
      console.log('changed, value:', newValue)
    },
    onBlur: props => (event, { newValue }) => {
      // props.store.treeFilter.setText(newValue)
      console.log('blured, value:', newValue)
    },
  }),
  observer
)

const Tree = ({
  store,
  onChange,
  onBlur,
}: {
  store: Object,
  onChange: () => {},
  onBlur: () => {},
}) => {
  const inputProps = {
    value: store.treeFilter.text,
    onChange,
    onBlur,
    type: 'search',
    placeholder: 'suchen',
  }
  let { suggestionsTO, suggestionsPC, suggestionsRC } = store.treeFilter
  suggestionsTO = suggestionsTO.map(s => {
    s.title = 'Objekte'
    return s
  })
  suggestionsPC = suggestionsPC.map(s => {
    s.title = 'Eigenschaften-Sammlungen'
    return s
  })
  suggestionsRC = suggestionsRC.map(s => {
    s.title = 'Beziehungs-Sammlungen'
    return s
  })
  const suggestions = [
    {
      title: `Objekte (${suggestionsTO.length})`,
      suggestions: suggestionsTO,
    },
    {
      title: `Eigenschaften-Sammlungen (${suggestionsPC.length})`,
      suggestions: suggestionsPC,
    },
    {
      title: `Beziehungs-Sammlungen (${suggestionsRC.length})`,
      suggestions: suggestionsRC,
    },
  ]
  console.log('TreeFilter: suggestions:', suggestions)

  return (
    <Container>
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={() => {
          // Autosuggest wants this function
        }}
        onSuggestionsClearRequested={() => {
          store.treeFilter.setSuggestionsTO([])
          store.treeFilter.setSuggestionsPC([])
          store.treeFilter.setSuggestionsRC([])
        }}
        getSuggestionValue={suggestion => {
          console.log('getting suggestion name:', suggestion.name)
          console.log('getting suggestion id:', suggestion.id)
          // TODO: change url based on id
          return suggestion.name
        }}
        renderSuggestion={suggestion => <span>{suggestion.name}</span>}
        multiSection={true}
        renderSectionTitle={section => <strong>{section.title}</strong>}
        getSectionSuggestions={section => section.suggestions}
        inputProps={inputProps}
      />
    </Container>
  )
}

export default enhance(Tree)
