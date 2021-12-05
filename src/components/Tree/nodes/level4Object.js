const level4Object = ({
  type,
  taxonomy,
  level3Object,
  taxonomySort,
  activeNodeArray,
}) => {
  if (activeNodeArray.length > 2 && activeNodeArray[2] === level3Object?.id) {
    return (level3Object?.objectsByParentId?.nodes ?? []).map((node) => {
      const childrenCount = node?.childrenCount?.totalCount ?? 0
      // give nodeName a value if it does not yet exist
      // otherwise empty nodes are sorted before its parent
      const nodeName = node.name || 'ZZZZ'

      return {
        id: node.id,
        url: [type, taxonomy?.id, level3Object?.id, node.id],
        sort: [taxonomySort, taxonomy?.name, level3Object?.name, nodeName],
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

export default level4Object
