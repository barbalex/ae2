// TODO!
/**
 * Idea:
 * check if the field already exists
 * if not: add it
 * if true:
 * 1. copy row
 * 2. add fields to that
 * 3. add row to additional rows
 */
import get from 'lodash/get'
import clone from 'lodash/clone'

import booleanToJaNein from '../../../modules/booleanToJaNein'
import conv from '../../../modules/convertExportFieldName'

const rowsFromObjectsRcoMultipleRows = ({
  thisObjectsRco,
  rcoProperties,
  row,
  aditionalRows,
}) => {
  let rowToUse = row
  thisObjectsRco.forEach((rco, index) => {
    // 0. check if first property already exist
    const firstProperty = rcoProperties[0]
    const firstField = `${conv(firstProperty.pcname)}__${conv(
      firstProperty.relationtype,
    )}__${firstProperty.pname}`
    if (firstField in row) {
      // copy row
      rowToUse = clone(row)
      aditionalRows.push(rowToUse)
    }
    // 1. check for Beziehungspartner_id
    const rcoP_id = rcoProperties.find(
      (p) =>
        p.pname === 'Beziehungspartner_id' &&
        p.relationtype === rco.relationType,
    )
    if (rcoP_id) {
      const bezPartnerId = get(
        thisObjectsRco[index],
        'objectByObjectIdRelation.id',
        null,
      )
      rowToUse[
        `${conv(rcoP_id.pcname)}__${conv(
          rcoP_id.relationtype,
        )}__Beziehungspartner_id`
      ] = bezPartnerId
    }
    // 2. check for Beziehungspartner_Name
    const rcoP_name = rcoProperties.find(
      (p) =>
        p.pname === 'Beziehungspartner_Name' &&
        p.relationtype === rco.relationType,
    )
    if (rcoP_name) {
      const bezPartnerTaxonomyName = get(
        thisObjectsRco[index],
        'objectByObjectIdRelation.taxonomyByTaxonomyId.name',
        '',
      )
      const bezPartnerName = get(
        thisObjectsRco[index],
        'objectByObjectIdRelation.name',
        '',
      )
      rowToUse[
        `${conv(rcoP_name.pcname)}__${conv(
          rcoP_name.relationtype,
        )}__Beziehungspartner_Name`
      ] = `${bezPartnerTaxonomyName}: ${bezPartnerName}`
    }
    // 3. get properties
    const properties = JSON.parse(rco.properties)
    rcoProperties.forEach((p) => {
      if (properties && properties[p.pname] !== undefined) {
        let val = properties[p.pname]
        if (typeof val === 'boolean') {
          val = booleanToJaNein(val)
        }
        rowToUse[
          `${conv(p.pcname)}__${conv(p.relationtype)}__${conv(p.pname)}`
        ] = val
      }
    })
  })

  // add every field if still missing
  rcoProperties.forEach((p) => {
    if (
      rowToUse[
        `${conv(p.pcname)}__${conv(p.relationtype)}__${conv(p.pname)}`
      ] === undefined
    ) {
      rowToUse[
        `${conv(p.pcname)}__${conv(p.relationtype)}__${conv(p.pname)}`
      ] = null
    }
  })
}

export default rowsFromObjectsRcoMultipleRows
