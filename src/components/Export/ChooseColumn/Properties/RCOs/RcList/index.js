import React, { useContext } from 'react'
import { useQuery, gql } from '@apollo/client'
import { observer } from 'mobx-react-lite'
import styled from '@emotion/styled'

import RCO from './RCO'
import storeContext from '../../../../../../storeContext'
import Spinner from '../../../../../shared/Spinner'

const SpinnerContainer = styled.div`
  padding-top: 15px;
`

const propsByTaxQuery = gql`
  query exportRcoListQuery($exportTaxonomies: [String]) {
    exportRcoList(exportTaxonomies: $exportTaxonomies) {
      nodes {
        pcname
        relationtype
        count
      }
    }
  }
`

const RCOs = () => {
  const store = useContext(storeContext)
  const exportTaxonomies = store.export.taxonomies.toJSON()

  const { data, error, loading } = useQuery(propsByTaxQuery, {
    variables: {
      exportTaxonomies,
      queryExportTaxonomies: exportTaxonomies.length > 0,
    },
  })

  const nodes = data?.exportRcoList?.nodes ?? []

  if (error) return `Error fetching data: ${error.message}`

  if (loading) {
    return (
      <SpinnerContainer>
        <Spinner message="" />
      </SpinnerContainer>
    )
  }

  return nodes.map(({ pcname, relationtype, count }) => (
    <RCO
      key={pcname}
      pcname={pcname}
      relationtype={relationtype}
      count={count}
    />
  ))
}

export default observer(RCOs)
