import gql from 'graphql-tag'

export default gql`
  mutation upsertRCO(
    $id: UUID
    $objectId: UUID!
    $objectIdRelation: UUID!
    $propertyCollectionId: UUID!
    $propertyCollectionOfOrigin: UUID
    $relationType: String!
    $properties: JSON
  ) {
    upsertRelation(
      input: {
        relation: {
          id: $id
          objectId: $objectId
          objectIdRelation: $objectIdRelation
          propertyCollectionId: $propertyCollectionId
          propertyCollectionOfOrigin: $propertyCollectionOfOrigin
          relationType: $relationType
          properties: $properties
        }
      }
    ) {
      relation {
        id
        objectId
        objectIdRelation
        propertyCollectionId
        propertyCollectionOfOrigin
        relationType
        properties
      }
    }
  }
`
