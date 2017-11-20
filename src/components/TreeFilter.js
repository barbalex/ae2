// @flow
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { observer } from 'mobx-react'
import styled from 'styled-components'
import compose from 'recompose/compose'
import withHandlers from 'recompose/withHandlers'
import withState from 'recompose/withState'
import Autosuggest from 'react-autosuggest'
import { withApollo, graphql } from 'react-apollo'

import treeFilterTextMutation from '../modules/treeFilterTextMutation'
import activeNodeArrayMutation from '../modules/activeNodeArrayMutation'
import treeFilterIdMutation from '../modules/treeFilterIdMutation'
import treeFilterTextGql from '../modules/treeFilterTextGql'

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

const treeFilterTextData = graphql(treeFilterTextGql, {
  name: 'treeFilterTextData',
})

const enhance = compose(
  withApollo,
  treeFilterTextData,
  withState('autosuggestWidth', 'changeAutosuggestWidth', 380),
  withHandlers({
    onChange: ({ client }) => (event, { newValue }) =>
      client.mutate({
        mutation: treeFilterTextMutation,
        variables: { value: newValue },
      }),
  }),
  /**
   * TODO
   * If the observer is removed, maximum update depth is exceeded
   * no idea why
   */
  observer
)

class TreeFilter extends Component {
  props: {
    client: Object,
    appData: Object,
    treeFilterTextData: Object,
    onChange: () => {},
    autosuggestWidth: number,
    changeAutosuggestWidth: () => {},
  }

  autosuggest: ?HTMLDivElement

  componentDidMount() {
    const { changeAutosuggestWidth } = this.props
    const autosuggestDomNode =
      this.autosuggest && ReactDOM.findDOMNode(this.autosuggest)
    const autosuggestWidth = autosuggestDomNode
      ? autosuggestDomNode.clientWidth
      : 380
    changeAutosuggestWidth(autosuggestWidth)
  }

  componentDidUpdate() {
    const { changeAutosuggestWidth } = this.props
    const autosuggestDomNode =
      this.autosuggest && ReactDOM.findDOMNode(this.autosuggest)
    const autosuggestWidth = autosuggestDomNode
      ? autosuggestDomNode.clientWidth
      : 380
    changeAutosuggestWidth(autosuggestWidth)
  }

  render() {
    const {
      client,
      onChange,
      autosuggestWidth,
      appData,
      treeFilterTextData,
    } = this.props
    const { treeFilterText } = treeFilterTextData
    //console.log('TreeFilter: treeFilterText:', treeFilterText)
    //console.log('TreeFilter: objekt:', objekt)
    const { filterSuggestionsTO, filterSuggestionsPC } = appData
    const inputProps = {
      value: treeFilterText || '',
      onChange,
      type: 'search',
      placeholder: 'suchen',
      spellCheck: false,
    }
    //console.log('TreeFilter: inputProps:', inputProps)
    //console.log('TreeFilter: data:', data)
    //console.log('TreeFilter: filterSuggestionsTO:', filterSuggestionsTO)
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
          ...{
            type: 't0',
          },
        })
      })
    }
    const suggestionsPC = []
    if (filterSuggestionsPC && filterSuggestionsPC.nodes) {
      filterSuggestionsPC.nodes.forEach(s => {
        suggestionsPC.push({
          ...s,
          ...{
            type: 'pC',
          },
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
    //console.log('TreeFilter: suggestionsTO:', suggestionsTO)

    return (
      <Container data-autosuggestwidth={autosuggestWidth}>
        <Autosuggest
          ref={c => (this.autosuggest = c)}
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
          onSuggestionSelected={(event, { suggestion }) => {
            console.log('TreeFilter: sugestion selected:', suggestion)
            switch (suggestion.type) {
              case 'pC':
                client.mutate({
                  mutation: activeNodeArrayMutation,
                  variables: {
                    value: ['Eigenschaften-Sammlungen', suggestion.id],
                  },
                })
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
                console.log(
                  'TreeFilter: mutating treeFilterId to:',
                  suggestion.id
                )
                client.mutate({
                  mutation: treeFilterIdMutation,
                  variables: { value: suggestion.id },
                })
              }
            }
          }}
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
}

export default enhance(TreeFilter)
