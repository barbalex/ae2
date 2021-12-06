const level2Benutzer = ({ activeNodeArray, treeData, store }) => {
  if (activeNodeArray[0] === 'Benutzer' && !!store.login.token) {
    const nodes = treeData?.allUsers?.nodes ?? []

    return nodes.map((n) => ({
      id: n.id,
      url: ['Benutzer', n.id],
      sort: [4, n.name],
      label: n.name,
      childrenCount: 0,
      children: [],
      menuType: 'CmBenutzer',
    }))
  }
  return []
}

export default level2Benutzer
