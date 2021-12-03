const setUserFromIdb = async ({ idb, store }) => {
  const users = await idb.users.toArray()
  const username = users?.[0]?.name ?? ''
  const token = users?.[0]?.token ?? null

  store.login.setLogin({ username, token })
}

export default setUserFromIdb
