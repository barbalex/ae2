// @flow
import { extendObservable, autorun, reaction, toJS } from 'mobx'
import isEqual from 'lodash/isEqual'
import get from 'lodash/get'

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
      // () => store.props,
      () => store.setActiveObject(get(store.props, 'activeObject', null))
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
