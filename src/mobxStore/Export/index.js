import { types } from 'mobx-state-tree'

import TaxProperty, { defaultValue as defaultTaxProperty } from './TaxProperty'
import PcoProperty, { defaultValue as defaultPcoProperty } from './PcoProperty'
import RcoProperty, { defaultValue as defaultRcoProperty } from './RcoProperty'
import TaxFilter, { defaultValue as defaultTaxFilter } from './TaxFilter'
import PcoFilter, { defaultValue as defaultPcoFilter } from './PcoFilter'
import RcoFilter, { defaultValue as defaultRcoFilter } from './RcoFilter'

export default types.model('Export', {
  type: types.optional(types.maybeNull(types.string), null),
  taxonomies: types.optional(types.array(types.string), []),
  ids: types.optional(types.array(types.string), []),
  taxProperties: types.optional(TaxProperty, defaultTaxProperty),
  pcoProperties: types.optional(PcoProperty, defaultPcoProperty),
  rcoProperties: types.optional(RcoProperty, defaultRcoProperty),
  taxFilter: types.optional(TaxFilter, defaultTaxFilter),
  pcoFilter: types.optional(PcoFilter, defaultPcoFilter),
  rcoFilter: types.optional(RcoFilter, defaultRcoFilter),
})

export const defaultValue = {}
