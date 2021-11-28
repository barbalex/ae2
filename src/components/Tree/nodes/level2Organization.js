import union from 'lodash/union'
import jwtDecode from 'jwt-decode'

const level2Organization = ({ treeData, mobxStore }) => {
  if (!treeData) return []
  const { token } = mobxStore.login
  if (!token) return []
  const tokenDecoded = jwtDecode(token)
  const username = tokenDecoded?.username
  if (!username) return []
  const user = (treeData?.allUsers?.nodes ?? []).find(
    (u) => u.name === username,
  )
  if (!user) return []
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
    menuType: 'organization',
  }))
}

export default level2Organization
