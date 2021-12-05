const level8Object = ({
  type,
  taxonomy,
  taxonomySort,
  level3Object,
  level4Object,
  level5Object,
  level6Object,
  level7Object,
  activeNodeArray,
}) => {
  if (activeNodeArray.length > 6 && activeNodeArray[6] === level7Object?.id) {
    return (level7Object?.objectsByParentId?.nodes ?? []).map((node) => {
      const childrenCount = node?.childrenCount?.totalCount ?? 0
      // give nodeName a value if it does not yet exist
      // otherwise empty nodes are sorted before its parent
      const nodeName = node.name || 'ZZZZ'

      return {
        id: node.id,
        url: [
          type,
          taxonomy?.id,
          level3Object?.id,
          level4Object?.id,
          level5Object?.id,
          level6Object?.id,
          level7Object?.id,
          node.id,
        ],
        sort: [
          taxonomySort,
          taxonomy?.name,
          level3Object?.name,
          level4Object?.name,
          level5Object?.name,
          level6Object?.name,
          level7Object?.name,
          nodeName,
        ],
        label: node.name,
        info:
          childrenCount > 0
            ? ` (${childrenCount.toLocaleString('de-CH')})`
            : '',
        childrenCount,
        children: [],
        menuType: 'CmObject',
      }
    })
  }
  return []
}

export default level8Object
