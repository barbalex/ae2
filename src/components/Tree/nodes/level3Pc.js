const level3Pc = ({ activeNodeArray, treeData, pC }) => {
  if (activeNodeArray.length > 1 && activeNodeArray[1] === pC?.id) {
    const pCId = treeData?.level3Pc?.id ?? null
    const pCName = treeData?.level3Pc?.name ?? null
    if (!pCId) return []
    const pCCount =
      treeData?.level3Pc?.propertyCollectionObjectsByPropertyCollectionId
        ?.totalCount ?? 0
    const rCCount =
      treeData?.level3Pc?.relationsByPropertyCollectionId?.totalCount ?? 0

    return [
      {
        id: `${pCId}pC`,
        url: ['Eigenschaften-Sammlungen', pCId, 'Eigenschaften'],
        sort: [3, pCName, 1],
        label: 'Eigenschaften',
        info: `(${pCCount.toLocaleString('de-CH')})`,
        childrenCount: 0,
        children: [],
        menuType: 'pCProperties',
      },
      {
        id: `${pCId}rC`,
        url: ['Eigenschaften-Sammlungen', pCId, 'Beziehungen'],
        sort: [3, pCName, 2],
        label: 'Beziehungen',
        info: `(${rCCount.toLocaleString('de-CH')})`,
        childrenCount: 0,
        children: [],
        menuType: 'pCRelations',
      },
    ]
  }
  return []
}

export default level3Pc
