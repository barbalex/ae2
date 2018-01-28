// @flow
import get from 'lodash/get'
import app from 'ampersand-app'

import createUserMutation from '../../Benutzer/createUserMutation'
import deleteUserMutation from '../../Benutzer/deleteUserMutation'
import createObjectMutation from '../../Objekt/createObjectMutation'
import deleteObjectMutation from '../../Objekt/deleteObjectMutation'
import treeDataGql from '../treeDataGql'
import treeDataVariables from '../treeDataVariables'
import activeNodeArrayData from '../../../modules/activeNodeArrayData'

export default async ({
  e,
  data,
  target,
  client,
  userData,
  treeData,
  activeNodeArray,
}: {
  e: Object,
  data: Object,
  target: Object,
  client: Object,
  userData: Object,
  treeData: Object,
  activeNodeArray: Object,
}) => {
  if (!data) return console.log('no data passed with click')
  if (!target) {
    return console.log('no target passed with click')
  }
  const { table, action } = data
  const id = target.firstElementChild.getAttribute('data-id')
  const url = target.firstElementChild.getAttribute('data-url').split(',')
  const actions = {
    insert: async () => {
      if (table === 'user') {
        let newUser
        try {
          newUser = await client.mutate({
            mutation: createUserMutation,
          })
        } catch (error) {
          console.log(error)
        }
        const newUserId = get(newUser, 'data.createUser.user.id')
        userData.refetch()
        treeData.refetch()
        !!newUserId && app.history.push(`/Benutzer/${newUserId}`)
      }
      if (table === 'object') {
        const newObjectData = await client.mutate({
          mutation: createObjectMutation,
          variables: { taxonomyId: url[2], parentId: id },
        })
        const newId = get(newObjectData, 'data.createObject.object.id', null)
        app.history.push(`/${[...url, newId].join('/')}`)
        treeData.refetch()
      }
    },
    delete: async () => {
      if (table === 'user') {
        try {
          await client.mutate({
            mutation: deleteUserMutation,
            variables: { id },
          })
        } catch (error) {
          console.log(error)
        }
        userData.refetch()
        treeData.refetch()
        app.history.push('/Benutzer')
      }
      if (table === 'object') {
        await client.mutate({
          mutation: deleteObjectMutation,
          variables: { id },
          optimisticResponse: {
            deleteOrganizationUserById: {
              object: {
                id,
                __typename: 'Object',
              },
              __typename: 'Mutation',
            },
          },
          update: (proxy, { data: { deleteObjectMutation } }) => {
            const data = proxy.readQuery({
              query: treeDataGql,
              variables: treeDataVariables({ activeNodeArrayData }),
            })
            const orgUsers = get(
              data,
              'organizationByName.organizationUsersByOrganizationId.nodes',
              []
            )
            const newOrgUsers = orgUsers.filter(u => u.id !== orgUser.id)
            set(
              data,
              'organizationByName.organizationUsersByOrganizationId.nodes',
              newOrgUsers
            )
            proxy.writeQuery({
              query: orgUsersGql,
              variables: { name: orgName },
              data,
            })
          },
        })
        if (url.includes(id)) {
          url.length = url.indexOf(id)
          app.history.push(`/${url.join('/')}`)
        }
        /**
         * TODO
         * refetch does not remove node from tree
         * need to optimistically update
         */
        treeData.refetch()
      }
    },
  }
  if (Object.keys(actions).includes(action)) {
    actions[action]()
  } else {
    console.log(`action "${action}" unknown, therefore not executed`)
  }
}
