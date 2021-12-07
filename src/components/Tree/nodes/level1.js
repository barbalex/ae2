import union from 'lodash/union'

import level2Taxonomy from './level2Taxonomy'
import level2Pc from './level2Pc'
import level2Benutzer from './level2Benutzer'
import level2Organization from './level2Organization'

const level1 = ({ treeData, loading, store, activeNodeArray }) => {
  const { token } = store.login
  if (!treeData) {
    return [
      {
        id: 'Arten',
        url: ['Arten'],
        sort: [1],
        label: 'Arten',
        info: '... Taxonomien',
        childrenCount: 2,
        children: [],
        menuType: 'CmType',
      },
      {
        id: 'Lebensräume',
        url: ['Lebensräume'],
        sort: [2],
        label: 'Lebensräume',
        info: '... Lebensräume',
        childrenCount: 2,
        children: [],
        menuType: 'CmType',
      },
      {
        id: 'Eigenschaften-Sammlungen',
        url: ['Eigenschaften-Sammlungen'],
        sort: [3],
        label: 'Eigenschaften-Sammlungen',
        info: '...',
        childrenCount: 2,
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
              info: '...',
              childrenCount: 2,
              children: [],
              menuType: 'CmBenutzerFolder',
            },
          ]
        : []),
    ]
  }

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
  const userCount = treeData?.allUsers?.totalCount ?? 0
  const userInfo = loading ? '(...)' : `(${userCount})`

  const user = treeData?.userByName ?? {}
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
      children: level2Pc({ activeNodeArray, treeData }),
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
            children: level2Benutzer({ activeNodeArray, treeData, store }),
            menuType: 'CmBenutzerFolder',
          },
        ]
      : []),
  ]
  if (token && orgsUserIsAdminIn.length > 0) {
    nodes.push({
      id: 'Organisationen',
      url: ['Organisationen'],
      sort: [5],
      label: 'Organisationen',
      info: orgInfo,
      childrenCount: orgsUserIsAdminIn.length,
      children: level2Organization({ activeNodeArray, treeData, store }),
      menuType: 'orgFolder',
    })
  }
  return nodes
}

export default level1
