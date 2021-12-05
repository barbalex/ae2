import level8Object from './level8Object'

const level7Object = ({
  type,
  taxonomy,
  taxonomySort,
  level3Object,
  level4Object,
  level5Object,
  level6Object,
  activeNodeArray,
}) => {
  if (activeNodeArray.length > 5 && activeNodeArray[5] === level6Object?.id) {
    return (level6Object?.objectsByParentId?.nodes ?? []).map((node) => {
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
          node.id,
        ],
        sort: [
          taxonomySort,
          taxonomy?.name,
          level3Object?.name,
          level4Object?.name,
          level5Object?.name,
          level6Object?.name,
          nodeName,
        ],
        label: node.name,
        info:
          childrenCount > 0
            ? ` (${childrenCount.toLocaleString('de-CH')})`
            : '',
        childrenCount,
        children: level8Object({
          type,
          taxonomy,
          taxonomySort,
          level3Object,
          level4Object,
          level5Object,
          level6Object,
          level7Object: node,
          activeNodeArray,
        }),
        menuType: 'CmObject',
      }
    })
  }
  return []
}

export default level7Object
