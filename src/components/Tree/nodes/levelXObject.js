const levelXObject = ({
  level,
  parentObjects,
  parentObject,
  parentUrl,
  parentSort,
  activeNodeArray,
}) => {
  if (
    activeNodeArray.length > level - 2 &&
    activeNodeArray[level - 2] === parentObject?.id
  ) {
    return (parentObject?.objectsByParentId?.nodes ?? []).map((node) => {
      const childrenCount = node?.childrenCount?.totalCount ?? 0
      // give nodeName a value if it does not yet exist
      // otherwise empty nodes are sorted before its parent
      const nodeName = node.name || 'ZZZZ'

      return {
        id: node.id,
        url: [...parentUrl, node.id],
        sort: [...parentSort, nodeName],
        label: node.name,
        info:
          childrenCount > 0
            ? ` (${childrenCount.toLocaleString('de-CH')})`
            : '',
        childrenCount,
        children: levelXObject({
          level: level + 1,
          parentObjects: [...parentObjects, parentObject],
          parentObject: node,
          parentUrl: [...parentUrl, node.id],
          parentSort: [...parentSort, nodeName],
          activeNodeArray,
        }),
        menuType: 'CmObject',
      }
    })
  }
  return []
}

export default levelXObject
