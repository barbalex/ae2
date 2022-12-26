import { useQuery, gql } from '@apollo/client'
import isUuid from 'is-uuid'
import { observer } from 'mobx-react-lite'
import { useSearchParams, useNavigate } from 'react-router-dom'

import getUrlForObject from '../modules/getUrlForObject'
import getUrlParamByName from '../modules/getUrlParamByName'

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
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  /**
   * check if old url was passed that contains objectId-Param
   * for instance:
   * /?id=AD0B10AA-707D-42C6-B68D-8F88CCD2F0B3
   */
  const idParam = getUrlParamByName('id')
  const objectId =
    idParam && isUuid.anyNonNil(idParam) ? idParam.toLowerCase() : null

  const hasObjectId = !!objectId
  const { error, data } = useQuery(objectQuery, {
    variables: { id: objectId, hasObjectId },
  })

  if (hasObjectId) {
    if (error) return null
    // if idParam was passed, open object
    const url = getUrlForObject(data.objectById)
    navigate(`/${url.join('/')}`)
    // remove id param from url
    searchParams.delete('id')
    setSearchParams(searchParams)
  }
  return null
}

export default observer(IdParameter)
