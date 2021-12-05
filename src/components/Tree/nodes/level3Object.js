import level4Object from './level4Object'

const level3Object = ({
  type,
  taxonomy,
  taxonomySort,
  treeData,
  activeNodeArray,
}) => {
  if (activeNodeArray.length > 1 && activeNodeArray[1] === taxonomy?.id) {
    return (treeData?.level3Object?.nodes ?? []).map((node) => {
      const childrenCount = node?.childrenCount?.totalCount ?? 0
      // give nodeName a value if it does not yet exist
      // otherwise empty nodes are sorted before its parent
      const nodeName = node.name ?? 'ZZZZ'

      return {
        id: node.id,
        url: [type, taxonomy?.id, node.id],
        sort: [taxonomySort, taxonomy?.name, nodeName],
        label: node.name,
        info:
          childrenCount > 0 ? `(${childrenCount.toLocaleString('de-CH')})` : '',
        childrenCount,
        children: level4Object({
          type,
          taxonomy,
          level3Object: node,
          taxonomySort,
          activeNodeArray,
        }),
        menuType: 'CmObject',
      }
    })
  }
  return []
}

export default level3Object
