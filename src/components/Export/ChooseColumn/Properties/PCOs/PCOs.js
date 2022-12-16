import React, { useContext } from 'react'
import { useQuery, gql } from '@apollo/client'
import groupBy from 'lodash/groupBy'
import styled from '@emotion/styled'
import { observer } from 'mobx-react-lite'

import PCO from './PCO'
import storeContext from '../../../../../storeContext' 
import Spinner from '../../../../shared/Spinner'

const SpinnerContainer = styled.div`
  padding-top: 15px;
`


const query = gql`
  query propsByTaxDataQueryForPropertiesPCOs($exportTaxonomies: [String!]) {
    pcoPropertiesByTaxonomiesCountPerPc(exportTaxonomies: $exportTaxonomies) {
      nodes {
        name
        count
      }
    }
  }
`

const PCOs = () => {
  const store = useContext(storeContext)
  const exportTaxonomies = store.export.taxonomies.toJSON()

  const { data, error, loading } = useQuery(query, {
    variables: {
      exportTaxonomies,
    },
  })  
  const nodes = data?.pcoPropertiesByTaxonomiesCountPerPc?.nodes ?? []


  if (error) return `Error fetching data: ${error.message}`

  if (loading) {
    return (
      <SpinnerContainer>
        <Spinner message="" />
      </SpinnerContainer>
    )
  }

  return nodes.map(({name, count}) => <PCO key={name} pcName={name} count={count} />)
}

export default observer(PCOs)
