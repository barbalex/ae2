import level3Pc from './level3Pc'

const level2Pc = ({ activeNodeArray, treeData }) => {
  if (activeNodeArray[0] === 'Eigenschaften-Sammlungen') {
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
        childrenCount: 2,
        children: level3Pc({ activeNodeArray, treeData, pC: node }),
        menuType: 'CmPC',
      }
    })
  }
  return []
}

export default level2Pc
