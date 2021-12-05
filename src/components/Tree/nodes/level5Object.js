import level6Object from './level6Object'

const level5Object = ({
  type,
  taxonomy,
  taxonomySort,
  level3Object,
  level4Object,
  activeNodeArray,
}) => {
  if (activeNodeArray.length > 3 && activeNodeArray[3] === level4Object?.id) {
    return (level4Object?.objectsByParentId?.nodes ?? []).map((node) => {
      const childrenCount = node?.childrenCount?.totalCount ?? 0
      // give nodeName a value if it does not yet exist
      // otherwise empty nodes are sorted before its parent
      const nodeName = node.name || 'ZZZZ'

      return {
        id: node.id,
        url: [type, taxonomy.id, level3Object?.id, level4Object?.id, node.id],
        sort: [
          taxonomySort,
          taxonomy?.name,
          level3Object?.name,
          level4Object?.name,
          nodeName,
        ],
        label: node.name,
        info:
          childrenCount > 0
            ? ` (${childrenCount.toLocaleString('de-CH')})`
            : '',
        childrenCount,
        children: level6Object({
          type,
          taxonomy,
          taxonomySort,
          level3Object,
          level4Object,
          level5Object: node,
          activeNodeArray,
        }),
        menuType: 'CmObject',
      }
    })
  }
  return []
}

export default level5Object
