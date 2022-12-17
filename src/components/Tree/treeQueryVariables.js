import { getSnapshot } from 'mobx-state-tree'

const treeQueryVariables = (store) => {
  const activeNodeArray = getSnapshot(store.activeNodeArray)

  return {
    username: store.login.username ?? '',
    url: activeNodeArray.filter((n) => n !== 0),
    hasToken: !!store.login.token,
  }
}

export default treeQueryVariables
