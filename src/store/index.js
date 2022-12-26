import { types } from 'mobx-state-tree'
import isEqual from 'lodash/isEqual'

import Export, { defaultValue as defaultExport } from './Export'
import TreeFilter, { defaultValue as defaultTreeFilter } from './TreeFilter'
import Login, { defaultValue as defaultLogin } from './Login'
import getActiveNodeArrayFromPathname from '../modules/getActiveNodeArrayFromPathname'

const store = () =>
  types
    .model({
      export: types.optional(Export, defaultExport),
      editingTaxonomies: types.optional(types.boolean, false),
      editingPCs: types.optional(types.boolean, false),
      activeNodeArray: types.optional(
        types.array(types.union(types.string, types.number)),
        [],
      ),
      treeFilter: types.optional(TreeFilter, defaultTreeFilter),
      login: types.optional(Login, defaultLogin),
      historyAfterLogin: types.optional(types.string, ''),
      sidebarWidth: types.maybeNull(types.number, null),
      docFilter: types.optional(types.union(types.string, types.number), ''),
      homeWidth: types.optional(types.number, 800),
      windowWidth: types.optional(types.number, 800),
      windowHeight: types.optional(types.number, 800),
      stacked: types.optional(types.boolean, false),
    })
    .actions((self) => ({
      setStacked(val) {
        self.stacked = val
      },
      setWindowHeight(val) {
        self.windowHeight = val
      },
      setWindowWidth(val) {
        self.windowWidth = val
      },
      setHomeWidth(val) {
        self.homeWidth = val
      },
      setSidebarWidth(val) {
        self.sidebarWidth = val
      },
      setDocFilter(val) {
        self.docFilter = val
      },
      setEditingTaxonomies(value) {
        self.editingTaxonomies = value
      },
      setEditingPCs(value) {
        self.editingPCs = value
      },
      setActiveNodeArray(value, navigate) {
        self.activeNodeArray = value
        const activeNodeArrayFromUrl = getActiveNodeArrayFromPathname()
        if (!isEqual(activeNodeArrayFromUrl, value) && navigate) {
          navigate(`/${value.join('/')}`)
        }
      },
      setHistoryAfterLogin(value) {
        self.historyAfterLogin = value
      },
    }))
    .views((self) => ({
      get singleColumnView() {
        return self.windowWidth <= 700
      },
    }))

export default store
