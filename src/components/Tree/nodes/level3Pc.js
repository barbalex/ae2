const level3Pc = ({ treeData }) => {
  if (!treeData) return []
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
      menuType: 'pCProperties',
    },
    {
      id: `${pCId}pC`,
      url: ['Eigenschaften-Sammlungen', pCId, 'Beziehungen'],
      sort: [3, pCName, 2],
      label: 'Beziehungen',
      info: `(${rCCount.toLocaleString('de-CH')})`,
      childrenCount: 0,
      menuType: 'pCRelations',
    },
  ]
}

export default level3Pc
