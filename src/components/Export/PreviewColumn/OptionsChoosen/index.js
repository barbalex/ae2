import React, { useCallback, useContext } from 'react'
import Button from '@mui/material/Button'
import styled from '@emotion/styled'
import { observer } from 'mobx-react-lite'
import { getSnapshot } from 'mobx-state-tree'

import TaxFilterItems from './TaxFilterItems'
import PcoFilterItems from './PcoFilterItems'
import RcoFilterItems from './RcoFilterItems'
import TaxPropertiesItems from './TaxPropertiesItems'
import PcoPropertiesItems from './PcoPropertiesItems'
import RcoPropertiesItems from './RcoPropertiesItems'
import storeContext from '../../../../storeContext'

const Container = styled.div`
  margin: 0;
  padding: 8px 8px 0 8px;
  ul {
    margin-bottom: 5px;
  }
  ul > li > ul {
    margin-top: 0;
  }
  li {
    margin-bottom: 4px;
  }
  ul > li:first-of-type {
    padding-top: 4px;
  }
`
const Title = styled.div`
  font-weight: bold;
`
const ResetSpan = styled.span`
  margin-left: 8px;
  font-weight: 100;
  font-style: italic;
  cursor: pointer;
  text-decoration: underline dotted rgba(0, 0, 0, 0.3);
`
const StyledButton = styled(Button)`
  margin-left: 0 !important;
  margin-top: 0 !important;
`
const HinweiseUl = styled.ul`
  font-size: small;
`

const OptionsChoosen = () => {
  const store = useContext(storeContext)
  const {
    setType,
    type: exportType,
    setTaxonomies,
    withSynonymData,
    setWithSynonymData,
    pcoFilters: pcoFiltersPassed,
    rcoFilters: rcoFiltersPassed,
    taxFilters: taxFiltersPassed,
    resetPcoFilters,
    resetRcoFilters,
    resetTaxFilters,
    resetRcoProperties,
    rcoProperties: rcoPropertiesPassed,
    resetPcoProperties,
    pcoProperties: pcoPropertiesPassed,
    resetTaxProperties,
    taxProperties: taxPropertiesPassed,
  } = store.export
  const pcoFilters = getSnapshot(pcoFiltersPassed)
  const rcoFilters = getSnapshot(rcoFiltersPassed)
  const taxFilters = getSnapshot(taxFiltersPassed)
  const rcoProperties = getSnapshot(rcoPropertiesPassed)
  const pcoProperties = getSnapshot(pcoPropertiesPassed)
  const taxProperties = getSnapshot(taxPropertiesPassed)
  const exportTaxonomies = store.export.taxonomies.toJSON()

  const noDataChoosen =
    [
      ...exportTaxonomies,
      ...taxProperties,
      ...pcoProperties,
      ...rcoProperties,
      ...taxFilters,
      ...pcoFilters,
      ...rcoFilters,
    ].length === 0

  const onClickResetAll = useCallback(() => {
    setType(null)
    setTaxonomies([])
    resetPcoProperties()
    resetRcoProperties()
    resetTaxProperties()
    resetTaxFilters()
    resetPcoFilters()
    resetRcoFilters()
    setWithSynonymData(true)
  }, [
    resetPcoFilters,
    resetPcoProperties,
    resetRcoFilters,
    resetRcoProperties,
    resetTaxFilters,
    resetTaxProperties,
    setTaxonomies,
    setType,
    setWithSynonymData,
  ])
  const onClickResetType = useCallback(() => {
    setType()
    setTaxonomies([])
  }, [setTaxonomies, setType])
  const onClickResetTaxonomies = useCallback(() => {
    setTaxonomies([])
  }, [setTaxonomies])
  const onClickResetExportWithSynonymData = useCallback(() => {
    setWithSynonymData(true)
  }, [setWithSynonymData])

  if (noDataChoosen) return null

  return (
    <Container>
      <Title title="Gewählte Optionen">Gewählte Optionen</Title>
      <ul>
        <li>
          {`Typ: ${!exportType ? ' keiner' : exportType}`}
          {!!exportType && (
            <ResetSpan onClick={onClickResetType}>zurücksetzen</ResetSpan>
          )}
        </li>
        <li>
          {`Taxonomie${exportTaxonomies.length > 1 ? 'n' : ''}: ${
            exportTaxonomies.length === 0
              ? ' keine'
              : exportTaxonomies.join(', ')
          }`}
          {exportTaxonomies.length > 0 && (
            <ResetSpan onClick={onClickResetTaxonomies}>zurücksetzen</ResetSpan>
          )}
        </li>
        <li>
          {`${
            withSynonymData
              ? 'Informationen von Synonymen mit exportieren'
              : 'Ohne Informationen von Synonymen'
          }`}
          {!withSynonymData && (
            <ResetSpan onClick={onClickResetExportWithSynonymData}>
              zurücksetzen
            </ResetSpan>
          )}
        </li>
        <li>
          {`Filter:${
            [...taxFilters, ...pcoFilters, ...rcoFilters].length === 0
              ? ' keine'
              : ''
          }`}
          <ul>
            <TaxFilterItems taxFilters={taxFilters} />
            <PcoFilterItems pcoFilters={pcoFilters} />
            <RcoFilterItems rcoFilters={rcoFilters} />
          </ul>
        </li>
        <li>
          {`Eigenschaften:${
            [...taxProperties, ...pcoProperties, ...rcoProperties].length === 0
              ? ' keine (die id kommt immer mit)'
              : ' (die id kommt immer mit)'
          }`}
          <ul>
            <TaxPropertiesItems taxProperties={taxProperties} />
            <PcoPropertiesItems pcoProperties={pcoProperties} />
            <RcoPropertiesItems rcoProperties={rcoProperties} />
          </ul>
        </li>
      </ul>
      <Title title="Hinweise">Hinweise</Title>
      <HinweiseUl>
        <li>
          Spaltentitel werden aus den Namen der Taxonomie, Eigenschaften- oder
          Beziehungssammlung und dem jeweiligen Feldnamen zusammengesetzt. Bei
          Beziehungssammlungen muss auch noch der Typ der Beziehung
          berücksichtigt werden.
        </li>
        <li>
          Die Länge von Spaltentiteln ist auf 64 Zeichen begrenzt. Daher muss
          die Anwendung zu lange Namen kürzen. Gekürzte Namen können schwer
          verständlich sein.
        </li>
        <li>
          In seltenen Fällen kann das sogar dazu führen, dass der Export
          scheitert (wenn zwei gekürzte Namen identisch sind)
        </li>
        {rcoProperties.length > 0 && (
          <li>
            Eine Art oder ein Lebensraum kann Beziehungen zu <b>mehreren</b>{' '}
            anderen Arten oder Lebensräumen haben. Beziehungspartner und
            Eigenschaften mehrerer Beziehungen werden daher mit | getrennt in
            einer Zelle gesammelt.
          </li>
        )}
      </HinweiseUl>
      <StyledButton
        onClick={onClickResetAll}
        variant="outlined"
        color="inherit"
      >
        alle Optionen zurücksetzen
      </StyledButton>
    </Container>
  )
}

export default observer(OptionsChoosen)
