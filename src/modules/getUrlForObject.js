const getUrlForObject = (tO) => {
  let url = []
  const type = (tO?.taxonomyByTaxonomyId?.type ?? '')
    .replace('ART', 'Arten')
    .replace('LEBENSRAUM', 'Lebensräume')
  if (type) url.push(type)
  const taxonomyId = tO?.taxonomyByTaxonomyId?.id
  if (taxonomyId) url.push(taxonomyId)
  let tOIdsArray = []
  const level4Id = tO?.id
  if (level4Id) tOIdsArray.unshift(level4Id)
  const level5Id = tO?.objectByParentId?.id
  if (level5Id) tOIdsArray.unshift(level5Id)
  const level6Id = tO?.objectByParentId?.objectByParentId?.id
  if (level6Id) tOIdsArray.unshift(level6Id)
  const level7Id = tO?.objectByParentId?.objectByParentId?.objectByParentId?.id
  if (level7Id) tOIdsArray.unshift(level7Id)
  const level8Id =
    tO?.objectByParentId?.objectByParentId?.objectByParentId?.objectByParentId
      ?.id
  if (level8Id) tOIdsArray.unshift(level8Id)
  const level9Id =
    tO?.objectByParentId?.objectByParentId?.objectByParentId?.objectByParentId
      ?.objectByParentId?.id
  if (level9Id) tOIdsArray.unshift(level9Id)
  const level10Id =
    tO?.objectByParentId?.objectByParentId?.objectByParentId?.objectByParentId
      ?.objectByParentId?.objectByParentId?.id
  if (level10Id) tOIdsArray.unshift(level10Id)

  if (tOIdsArray.length > 0) {
    url = [...url, ...tOIdsArray]
  }
  return url
}

export default getUrlForObject
