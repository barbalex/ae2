import union from 'lodash/union'
import jwtDecode from 'jwt-decode'

const level2Organization = ({ activeNodeArray, treeData, store }) => {
  const { token } = store.login
  if (!token) return []
  const tokenDecoded = jwtDecode(token)
  const username = tokenDecoded?.username
  if (!username) return []
  const user = treeData?.userByName
  if (!user) return []
  if (activeNodeArray[0] === 'Organisationen') {
    // TODO: query allOranizations instead, if user is admin?
    const orgUsers = user?.organizationUsersByUserId?.nodes ?? []
    const userOrganizations = union(
      orgUsers.map((u) => u?.organizationByOrganizationId?.name),
    )

    return userOrganizations.map((org) => ({
      id: org,
      url: ['Organisationen', org],
      sort: [5, org],
      label: org,
      childrenCount: 0,
      children: [],
      menuType: 'organization',
    }))
  }
  return []
}

export default level2Organization
