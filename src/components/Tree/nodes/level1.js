import union from 'lodash/union'

import level2Taxonomy from './level2Taxonomy'
import level2Lr from './level2Lr'

const level1 = ({ treeData, loading, store, activeNodeArray }) => {
  if (!treeData) return []

  const pcCount = treeData?.allPropertyCollections?.totalCount ?? 0
  const artTaxonomiesCount = treeData?.artTaxonomies?.totalCount
  const lrTaxonomiesCount = treeData?.lrTaxonomies?.totalCount
  const artenInfo = loading
    ? '(... Taxonomien)'
    : `(${artTaxonomiesCount} Taxonomie${artTaxonomiesCount !== 1 ? 'n' : ''})`
  const lrInfo = loading
    ? '(... Taxonomien)'
    : `(${lrTaxonomiesCount} Taxonomie${lrTaxonomiesCount !== 1 ? 'n' : ''})`
  const pcInfo = loading ? '(...)' : `(${pcCount})`
  const { token } = store.login
  const userCount = treeData?.allUsers?.totalCount ?? 0
  const userInfo = loading ? '(...)' : `(${userCount})`

  const nodes = [
    {
      id: 'Arten',
      url: ['Arten'],
      sort: [1],
      label: 'Arten',
      info: artenInfo,
      childrenCount: artTaxonomiesCount,
      children: level2Taxonomy({
        type: 'Arten',
        taxonomySort: 1,
        treeData,
        activeNodeArray,
      }),
      menuType: 'CmType',
    },
    {
      id: 'Lebensräume',
      url: ['Lebensräume'],
      sort: [2],
      label: 'Lebensräume',
      info: lrInfo,
      childrenCount: lrTaxonomiesCount,
      children: level2Taxonomy({
        type: 'Lebensräume',
        taxonomySort: 2,
        treeData,
        activeNodeArray,
      }),
      menuType: 'CmType',
    },
    {
      id: 'Eigenschaften-Sammlungen',
      url: ['Eigenschaften-Sammlungen'],
      sort: [3],
      label: 'Eigenschaften-Sammlungen',
      info: pcInfo,
      childrenCount: pcCount,
      children: [],
      menuType: 'CmPCFolder',
    },
    ...(token
      ? [
          {
            id: 'Benutzer',
            url: ['Benutzer'],
            sort: [4],
            label: 'Benutzer',
            info: userInfo,
            childrenCount: userCount,
            children: [],
            menuType: 'CmBenutzerFolder',
          },
        ]
      : []),
  ]
  if (token) {
    const user = treeData?.userByName ?? {}
    console.log('level1, user:', user)
    const orgUsers = user?.organizationUsersByUserId?.nodes ?? []
    const orgsUserIsAdminIn = union(
      orgUsers
        .filter((o) => o.role === 'orgAdmin')
        .map((u) => u?.organizationByOrganizationId?.name),
    )
    const orgInfo =
      loading && orgsUserIsAdminIn.length === 0
        ? '(...)'
        : `(${orgsUserIsAdminIn.length.toLocaleString('de-CH')})`
    if (orgsUserIsAdminIn.length > 0) {
      nodes.push({
        id: 'Organisationen',
        url: ['Organisationen'],
        sort: [5],
        label: 'Organisationen',
        info: orgInfo,
        childrenCount: orgsUserIsAdminIn.length,
        children: [],
        menuType: 'orgFolder',
      })
    }
  }
  return nodes
}

export default level1
