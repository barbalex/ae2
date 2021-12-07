import level3Object from './level3Object'

const level2Taxonomy = ({ activeNodeArray, treeData, type, taxonomySort }) => {
  if (activeNodeArray.length > 0 && activeNodeArray[0] === type) {
    const nodes =
      type === 'Arten'
        ? treeData?.artTaxonomies?.nodes
        : treeData?.lrTaxonomies?.nodes

    return (nodes ?? []).map((taxonomy) => ({
      id: taxonomy.id,
      url: [type, taxonomy.id],
      sort: [taxonomySort, taxonomy.name],
      label: taxonomy.name,
      info: `(${taxonomy?.topLevelObjects?.totalCount})`,
      childrenCount: taxonomy?.objectsByTaxonomyId?.totalCount ?? 0,
      children: level3Object({
        type,
        taxonomy,
        taxonomySort,
        treeData,
        activeNodeArray,
      }),
      menuType: 'CmTaxonomy',
    }))
  }
  return []
}

export default level2Taxonomy
