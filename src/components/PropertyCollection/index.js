// @flow
import React from 'react'
import compose from 'recompose/compose'
import styled from 'styled-components'
import get from 'lodash/get'
import format from 'date-fns/format'

import activeNodeArrayData from '../../modules/activeNodeArrayData'
import pCData from './pCData'
import PropertyReadOnly from '../shared/PropertyReadOnly'
import ErrorBoundary from '../shared/ErrorBoundary'

const enhance = compose(activeNodeArrayData, pCData)

const Container = styled.div`
  padding: 10px;
`

const PropertyCollection = ({ pCData }: { pCData: Object }) => {
  const { loading } = pCData
  if (loading) {
    return <Container>Lade Daten...</Container>
  }
  const pC = get(pCData, 'propertyCollectionById', {})
  const org = get(pC, 'organizationByOrganizationId.name', '')
  const user = get(pC, 'userByImportedBy', '')
  console.log('pC:', pC)

  return (
    <ErrorBoundary>
      <Container>
        <PropertyReadOnly key="name" value={pC.name} label="Name" />
        <PropertyReadOnly
          key="description"
          value={pC.description}
          label="Beschreibung"
        />
        <PropertyReadOnly
          key="combining"
          value={
            pC.combining !== undefined
              ? pC.combining
                  .toString()
                  .replace('true', 'ja')
                  .replace('false', 'nein')
              : ''
          }
          label="zusammenfassend"
        />
        <PropertyReadOnly
          key="lastUpdated"
          value={format(new Date(pC.lastUpdated), 'DD.MM.YYYY')}
          label="Zuletzt aktualisiert"
        />
        <PropertyReadOnly
          key="links"
          value={pC.links ? pC.links.join(', ') : ''}
          label="Links"
        />
        <PropertyReadOnly
          key="org"
          value={org}
          label="Zuständige Organisation"
        />
        <PropertyReadOnly
          key="importedBy"
          value={`${user.name} (${user.email})`}
          label="Importiert von"
        />
        <PropertyReadOnly
          key="termsOfUse"
          value={pC.termsOfUse}
          label="Nutzungs-Bedingungen"
        />
      </Container>
    </ErrorBoundary>
  )
}

export default enhance(PropertyCollection)
