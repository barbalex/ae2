// @flow
import { extendObservable, autorun, reaction, toJS } from 'mobx'
import isEqual from 'lodash/isEqual'
import get from 'lodash/get'
import gql from 'graphql-tag'
import app from 'ampersand-app'

import getActiveNodeArrayFromPathname from '../action/getActiveNodeArrayFromPathname'
import getUrlFromTOId from '../../modules/getUrlFromTOId'

export default (store: Object): void => {
  extendObservable(store, {
    manipulateActiveNodeArray: autorun('manipulateActiveNodeArray', () => {
      const activeNodeArray = toJS(store.activeNodeArray)
      // forward root to taxonomy
      if (activeNodeArray.length === 0) {
        return store.setActiveNodeArray(['Taxonomien'])
      }
      const activeNodeArrayFromUrl = getActiveNodeArrayFromPathname()
      if (!isEqual(activeNodeArrayFromUrl, activeNodeArray)) {
        store.history.push(`/${activeNodeArray.join('/')}`)
      }
      // set activeTreeLevel
      store.activeTreeLevel = activeNodeArray.length
    }),
    onChangeObject: reaction(
      () => get(store.props, 'activeObject', null),

      () => {
        const activeObject = get(store.props, 'activeObject', null)

        console.log('autorun: activeObject:', activeObject)
        console.log('autorun: activeObject.id:', activeObject.id)

        // TODO: update local apollo store
        const query = gql`
          query activeObjects {
            activeObjects @client {
              id
            }
          }
        `
        app.client
          .query({ query })
          .then(value => console.log('autorun: value before mutating:', value))

        const mutation = gql`
          mutation setActiveObject($id: String) {
            setActiveObject(id: $id) @client
          }
        `
        app.client.mutate({
          mutation,
          variables: { id: activeObject.id },
        })
        app.client
          .query({ query })
          .then(value => console.log('autorun: value after mutating:', value))

        return store.setActiveObject(activeObject)
      }
    ),
    onChangeCategories: reaction(
      () => get(store.props, 'allCategories.nodes', []),
      (categoryNodes: Array<Object>) => {
        const categoryNames = categoryNodes.map(c => c.name)
        const storeCategories = toJS(store.categories)
        if (!isEqual(storeCategories, categoryNames)) {
          store.setCategories(categoryNames)
        }
      }
    ),
    onChangePcoPropertiesByCategories: reaction(
      () => get(store.props, 'pcoPropertiesByCategoriesFunction.nodes', []),
      (pcoProperties: Array<Object>) =>
        store.export.setPcoProperties(pcoProperties)
    ),
    onChangeUrlFromTOData: reaction(
      () => store.props.urlFromTO,
      urlFromTO => {
        // do nothing when filterField was emptied
        if (urlFromTO) {
          store.setActiveNodeArray(getUrlFromTOId(urlFromTO))
          store.setUrlFromTOId(null)
        }
      }
    ),
    onChangeUrlFromPCData: reaction(
      () => store.urlFromPCId,
      urlFromPCId => {
        // do nothing when filterField was emptied
        if (urlFromPCId) {
          store.setActiveNodeArray(['Eigenschaften-Sammlungen', urlFromPCId])
          store.setUrlFromPCId(null)
        }
      }
    ),
  })
}
