import React, { useContext } from 'react'
import { useQuery, gql } from '@apollo/client'
import { observer } from 'mobx-react-lite'
import styled from '@emotion/styled'
import { withResizeDetector } from 'react-resize-detector'

import storeContext from '../../../../../../../storeContext'
import getConstants from '../../../../../../../modules/constants'
import AllChooser from './AllChooser'
import Properties from './Properties'
import Spinner from '../../../../../../shared/Spinner'

const constants = getConstants()

const PropertiesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`
const SpinnerContainer = styled.div`
  padding-top: 15px;
  width: 100%;
`

const query = gql`
  query propsByTaxDataQueryForFilterPCO(
    $exportTaxonomies: [String]
    $pcName: String!
  ) {
    pcoPropertiesByTaxonomiesAndPc(
      taxonomyNames: $exportTaxonomies
      pcName: $pcName
    ) {
      totalCount
      nodes {
        property
        type
      }
    }
  }
`

const ChooserRouter = ({ pcName, count, width = 500 }) => {
  const store = useContext(storeContext)
  const exportTaxonomies = store.export.taxonomies.toJSON()

  const { data, error, loading } = useQuery(query, {
    variables: {
      exportTaxonomies,
      pcName,
    },
  })

  const properties = data?.pcoPropertiesByTaxonomiesAndPc?.nodes ?? []

  const columns = Math.floor(width / constants.export.properties.columnWidth)

  if (error) return `Error fetching data: ${error.message}`

  if (loading) {
    return (
      <SpinnerContainer>
        <Spinner message="" />
      </SpinnerContainer>
    )
  }

  return (
    <>
      {count > 1 && <AllChooser properties={properties} pcName={pcName} />}
      <PropertiesContainer>
        <Properties properties={properties} columns={columns} pcName={pcName} />
      </PropertiesContainer>
    </>
  )
}

export default withResizeDetector(observer(ChooserRouter))
