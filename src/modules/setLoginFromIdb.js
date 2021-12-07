const setLoginFromIdb = async ({ idb, store }) => {
  const users = await idb.users.toArray()
  const token = users?.[0]?.token
  const username = users?.[0]?.username
  if (username && token) {
    store.login.setLogin({ username, token })
  }
}

export default setLoginFromIdb
