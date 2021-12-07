import { types } from 'mobx-state-tree'

export default types.model('PcoProperty', {
  pcname: types.optional(types.maybeNull(types.string), null),
  pname: types.optional(types.maybeNull(types.string), null),
})

export const defaultValue = {
  pcname: null,
  pname: null,
}
