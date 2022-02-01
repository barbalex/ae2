import buildLevel2BenutzerNodes from './nodes/level2Benutzer'
import buildLevel2OrganizationNodes from './nodes/level2Organization'
import sort from './nodes/sort'

const buildNodes = ({ treeData, activeNodeArray, store }) => {
  console.log('buildNodes, activeNodeArray:', activeNodeArray)
  let nodes = treeData?.treeFunction?.nodes ?? []
  // if (activeNodeArray.length > 0) {
  //   if (activeNodeArray[0] === 'Benutzer' && !!store.login.token) {
  //     nodes = [...nodes, ...buildLevel2BenutzerNodes({ treeData })]
  //   } else if (activeNodeArray[0] === 'Organisationen') {
  //     nodes = [...nodes, ...buildLevel2OrganizationNodes({ treeData, store })]
  //   }
  // }
  return nodes
}

export default buildNodes
