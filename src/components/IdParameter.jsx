import { useEffect, useContext, useMemo } from 'react'
import { useQuery, gql } from '@apollo/client'
import isUuid from 'is-uuid'
import { navigate } from 'gatsby'
import { observer } from 'mobx-react-lite'

import getUrlForObject from '../modules/getUrlForObject'
import getUrlParamByName from '../modules/getUrlParamByName'
import storeContext from '../storeContext'
import getActiveNodeArrayFromPathname from '../modules/getActiveNodeArrayFromPathname'

const objectQuery = gql`
  query ObjectQuery($id: UUID!, $hasObjectId: Boolean!) {
    objectById(id: $id) @include(if: $hasObjectId) {
      id
      taxonomyByTaxonomyId {
        id
        type
      }
      objectByParentId {
        id
        objectByParentId {
          id
          objectByParentId {
            id
            objectByParentId {
              id
              objectByParentId {
                id
                objectByParentId {
                  id
                  objectByParentId {
                    id
                    objectByParentId {
                      id
                      objectByParentId {
                        id
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

const IdParameter = () => {
  const store = useContext(storeContext)

  const { setActiveNodeArray } = store
  const pathname = useMemo(
    () => (typeof window !== 'undefined' ? window.location.pathname : []),
    [],
  )
  useEffect(() => {
    setActiveNodeArray(getActiveNodeArrayFromPathname())
  }, [pathname, setActiveNodeArray])
  /**
   * check if old url was passed that contains objectId-Param
   * for instance:
   * /?id=AD0B10AA-707D-42C6-B68D-8F88CCD2F0B3
   */
  const idParam = getUrlParamByName('id')
  const objectId =
    idParam && isUuid.anyNonNil(idParam) ? idParam.toLowerCase() : null

  const hasObjectId = !!objectId
  const { loading, error, data } = useQuery(objectQuery, {
    variables: { id: objectId, hasObjectId },
  })

  if (hasObjectId) {
    if (loading) return 'Loading...'
    if (error) return `Fehler: ${error.message}`
    // if idParam was passed, open object
    const url = getUrlForObject(data.objectById)
    navigate(`/${url.join('/')}`)
  }
  return null
}

export default observer(IdParameter)
