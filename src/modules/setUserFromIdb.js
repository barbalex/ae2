const setUserFromIdb = async ({ idb, mobxStore }) => {
  const users = await idb.users.toArray()
  const username = users?.[0]?.name ?? ''
  const token = users?.[0]?.token ?? null

  mobxStore.login.setLogin({ username, token })
}

export default setUserFromIdb
