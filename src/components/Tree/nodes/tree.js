const tree = ({ treeData }) => {
  const nodes = (treeData?.treeFunction?.nodes ?? []).map((n) => ({
    id: n.id,
    url: n.url,
    sort: n.sort,
    label: n.label,
    info: n.info,
    childrenCount: n.childrenCount,
    menuType: n.menuType,
  }))

  return nodes
}

export default tree
