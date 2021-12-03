import { navigate } from 'gatsby'

import createUserMutation from '../../Benutzer/createUserMutation'
import deleteUserMutation from '../../Benutzer/deleteUserMutation'
import createObjectMutation from '../../Objekt/createObjectMutation'
import createRootObjectMutation from '../../Objekt/createRootObjectMutation'
import deleteObjectMutation from '../../Objekt/deleteObjectMutation'
import createTaxonomyMutation from '../../Taxonomy/createTaxonomyMutation'
import createPCMutation from '../../PropertyCollection/createPCMutation'
import deletePCMutation from '../../PropertyCollection/deletePCMutation'
import deleteTaxonomyMutation from '../../Taxonomy/deleteTaxonomyMutation'

const onClickContextMenu = async ({
  data,
  target,
  client,
  treeRefetch,
  userId,
  store,
}) => {
  const { setEditingTaxonomies, setEditingPCs, editingTaxonomies } = store
  if (!data) return console.log('no data passed with click')
  if (!target) {
    return console.log('no target passed with click')
  }
  const { table, action } = data
  const id = target.firstElementChild.getAttribute('data-id')
  const url = target.firstElementChild.getAttribute('data-url').split(',')
  // console.log('onClickContextMenu', {
  //   data,
  //   table,
  //   action,
  //   id,
  //   url,
  //   activeNodeArray: getSnapshot(store.activeNodeArray),
  // })
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
        const newUserId = newUser?.data?.createUser?.user?.id
        !!newUserId && navigate(`/Benutzer/${newUserId}`)
      }
      if (table === 'object') {
        let newObjectData
        if (url.length === 2) {
          // user clicked on the taxonomy
          // need to create root level object, without parentId
          newObjectData = await client.mutate({
            mutation: createRootObjectMutation,
            variables: { taxonomyId: url[1] },
          })
        } else {
          newObjectData = await client.mutate({
            mutation: createObjectMutation,
            variables: { taxonomyId: url[1], parentId: id },
          })
        }
        const newId = newObjectData?.data?.createObject?.object?.id ?? null
        navigate(`/${[...url, newId].join('/')}`)
        // if not editing, set editing true
        if (!editingTaxonomies) {
          setEditingTaxonomies(true)
        }
      }
      if (table === 'taxonomy') {
        const typeConverter = {
          Arten: 'ART',
          Lebensräume: 'LEBENSRAUM',
        }
        const newTaxonomyData = await client.mutate({
          mutation: createTaxonomyMutation,
          variables: {
            type: typeConverter[id],
            importedBy: userId,
            lastUpdated: new Date(),
          },
        })
        const newId =
          newTaxonomyData?.data?.createTaxonomy?.taxonomy?.id ?? null
        navigate(`/${[...url, newId].join('/')}`)
        // if not editingTaxonomies, set editingTaxonomies true
        if (!editingTaxonomies) {
          setEditingTaxonomies(true)
        }
      }
      if (table === 'pc') {
        const newPCData = await client.mutate({
          mutation: createPCMutation,
          variables: { importedBy: userId, lastUpdated: new Date() },
        })
        const newId =
          newPCData?.data?.createPropertyCollection?.propertyCollection?.id ??
          null
        navigate(`/${[...url, newId].join('/')}`)
        // if not editing, set editingTaxonomies true
        if (!editingTaxonomies) {
          setEditingPCs(true)
        }
      }
      treeRefetch()
    },
    delete: async () => {
      if (table === 'user') {
        try {
          await client.mutate({
            mutation: deleteUserMutation,
            variables: { id },
            optimisticResponse: {
              deleteUserById: {
                user: {
                  id,
                  __typename: 'User',
                },
                __typename: 'Mutation',
              },
            },
          })
        } catch (error) {
          console.log(error)
        }
        navigate('/Benutzer')
      }
      if (table === 'object') {
        await client.mutate({
          mutation: deleteObjectMutation,
          variables: { id },
          optimisticResponse: {
            deleteObjectById: {
              object: {
                id,
                __typename: 'Object',
              },
              __typename: 'Mutation',
            },
          },
        })
        if (url.includes(id)) {
          url.length = url.indexOf(id)
          navigate(`/${url.join('/')}`)
        }
      }
      if (table === 'taxonomy') {
        await client.mutate({
          mutation: deleteTaxonomyMutation,
          variables: { id },
          optimisticResponse: {
            deleteTaxonomyById: {
              taxonomy: {
                id,
                __typename: 'Taxonomy',
              },
              __typename: 'Mutation',
            },
          },
        })
        if (url.includes(id)) {
          url.length = url.indexOf(id)
          navigate(`/${url.join('/')}`)
        }
      }
      if (table === 'pc') {
        await client.mutate({
          mutation: deletePCMutation,
          variables: { id },
          optimisticResponse: {
            deletePropertyCollectionById: {
              propertyCollection: {
                id,
                __typename: 'PropertyCollection',
              },
              __typename: 'Mutation',
            },
          },
        })
        if (url.includes(id)) {
          url.length = url.indexOf(id)
          navigate(`/${url.join('/')}`)
        }
      }
      treeRefetch()
    },
  }
  if (Object.keys(actions).includes(action)) {
    actions[action]()
  } else {
    console.log(`action "${action}" unknown, therefore not executed`)
  }
}

export default onClickContextMenu
