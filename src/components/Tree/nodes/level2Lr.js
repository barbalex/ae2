const level2Lr = ({ activeNodeArray, treeData }) => {
  if (activeNodeArray.length > 0 && activeNodeArray[0] === 'Lebensräume') {
    return (treeData?.lrTaxonomies?.nodes ?? []).map((taxonomy) => ({
      id: taxonomy.id,
      url: ['Lebensräume', taxonomy.id],
      sort: [2, taxonomy.name],
      label: taxonomy.name,
      info: `(${taxonomy?.topLevelObjects?.totalCount})`,
      childrenCount: taxonomy?.objectsByTaxonomyId?.totalCount ?? 0,
      children: [],
      menuType: 'CmTaxonomy',
    }))
  }
  return []
}

export default level2Lr
