const setLoginFromIdb = async ({ idb, mobxStore }) => {
  const users = await idb.users.toArray()
  const token = users?.[0]?.token
  const username = users?.[0]?.username
  if (username && token) {
    mobxStore.login.setLogin({ username, token })
  }
}

export default setLoginFromIdb
