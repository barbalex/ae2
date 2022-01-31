import { getSnapshot } from 'mobx-state-tree'

const treeQueryVariables = (store) => {
  const activeNodeArray = getSnapshot(store.activeNodeArray)

  return {
    existsLevel2Benutzer:
      activeNodeArray[0] === 'Benutzer' && !!store.login.token,
    username: store.login.username ?? 'no_user_with_this_name_exists',
    url: activeNodeArray,
  }
}

export default treeQueryVariables
