const level2Arten = ({ activeNodeArray, treeData }) => {
  if (activeNodeArray.length > 0 && activeNodeArray[0] === 'Arten') {
    return (treeData?.artTaxonomies?.nodes ?? []).map((taxonomy) => ({
      id: taxonomy.id,
      url: ['Arten', taxonomy.id],
      sort: [1, taxonomy.name],
      label: taxonomy.name,
      info: `(${taxonomy?.topLevelObjects?.totalCount})`,
      childrenCount: taxonomy?.objectsByTaxonomyId?.totalCount ?? 0,
      children: [],
      menuType: 'CmTaxonomy',
    }))
  }
  return []
}

export default level2Arten
