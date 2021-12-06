const level2Pc = ({ treeData }) => {
  if (!treeData) return []
  const nodes = treeData?.allPropertyCollections?.nodes ?? []

  return nodes.map((node) => {
    const pCCount =
      node?.propertyCollectionObjectsByPropertyCollectionId?.totalCount ?? 0
    const rCCount = node?.relationsByPropertyCollectionId?.totalCount ?? 0
    const count = pCCount + rCCount

    return {
      id: node.id,
      url: ['Eigenschaften-Sammlungen', node.id],
      sort: [3, node.name],
      label: node.name,
      info: `(${count.toLocaleString('de-CH')})`,
      childrenCount: count,
      children: [],
      menuType: 'CmPC',
    }
  })
}

export default level2Pc
