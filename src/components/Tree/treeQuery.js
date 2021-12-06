import { gql } from '@apollo/client'

export default gql`
  query TreeDataQuery(
    $existsLrTaxonomies: Boolean!
    $existsArtenTaxonomies: Boolean!
    $existsLevel2Pc: Boolean!
    $existsPCId: Boolean!
    $existsLevel2Taxonomy: Boolean!
    $level2Taxonomy: UUID!
    $existsLevel2Benutzer: Boolean!
    $existsLevel3Object: Boolean!
    $existsLevel4Object: Boolean!
    $existsLevel5Object: Boolean!
    $existsLevel6Object: Boolean!
    $existsLevel7Object: Boolean!
    $existsLevel8Object: Boolean!
    $existsLevel9Object: Boolean!
    $pCId: UUID!
    $username: String!
  ) {
    userByName(name: $username) {
      id
      name
      email
      organizationUsersByUserId {
        nodes {
          id
          organizationId
          role
          organizationByOrganizationId {
            id
            name
          }
        }
      }
    }
    allUsers {
      totalCount
      nodes @include(if: $existsLevel2Benutzer) {
        id
        name
        email
        organizationUsersByUserId {
          nodes {
            id
            organizationId
            role
            organizationByOrganizationId {
              id
              name
            }
          }
        }
      }
    }
    allPropertyCollections(orderBy: NAME_ASC) {
      totalCount
      nodes @include(if: $existsLevel2Pc) {
        id
        name
        propertyCollectionObjectsByPropertyCollectionId {
          totalCount
        }
        relationsByPropertyCollectionId {
          totalCount
        }
      }
    }
    artTaxonomies: allTaxonomies(
      filter: { type: { equalTo: ART } }
      orderBy: NAME_ASC
    ) {
      totalCount
      nodes @include(if: $existsArtenTaxonomies) {
        id
        name
        type
        objectsByTaxonomyId {
          totalCount
        }
        topLevelObjects: objectsByTaxonomyId(
          filter: { parentId: { isNull: true } }
        ) {
          totalCount
        }
      }
    }
    lrTaxonomies: allTaxonomies(
      filter: { type: { equalTo: LEBENSRAUM } }
      orderBy: NAME_ASC
    ) {
      totalCount
      nodes @include(if: $existsLrTaxonomies) {
        id
        name
        type
        objectsByTaxonomyId {
          totalCount
        }
        topLevelObjects: objectsByTaxonomyId(
          filter: { parentId: { isNull: true } }
        ) {
          totalCount
        }
      }
    }
    level3Pc: propertyCollectionById(id: $pCId) @include(if: $existsPCId) {
      id
      name
      propertyCollectionObjectsByPropertyCollectionId {
        totalCount
      }
      relationsByPropertyCollectionId {
        totalCount
      }
    }
    level3Object: allObjects(
      filter: {
        taxonomyId: { equalTo: $level2Taxonomy }
        parentId: { isNull: true }
      }
      orderBy: NAME_ASC
    ) @include(if: $existsLevel2Taxonomy) {
      nodes {
        id
        name
        childrenCount: objectsByParentId {
          totalCount
        }
        objectsByParentId @include(if: $existsLevel3Object) {
          nodes {
            id
            name
            childrenCount: objectsByParentId {
              totalCount
            }
            objectsByParentId @include(if: $existsLevel4Object) {
              nodes {
                id
                name
                childrenCount: objectsByParentId {
                  totalCount
                }
                objectsByParentId @include(if: $existsLevel5Object) {
                  nodes {
                    id
                    name
                    childrenCount: objectsByParentId {
                      totalCount
                    }
                    objectsByParentId @include(if: $existsLevel6Object) {
                      nodes {
                        id
                        name
                        childrenCount: objectsByParentId {
                          totalCount
                        }
                        objectsByParentId @include(if: $existsLevel7Object) {
                          nodes {
                            id
                            name
                            childrenCount: objectsByParentId {
                              totalCount
                            }
                            objectsByParentId
                              @include(if: $existsLevel8Object) {
                              nodes {
                                id
                                name
                                childrenCount: objectsByParentId {
                                  totalCount
                                }
                                objectsByParentId
                                  @include(if: $existsLevel9Object) {
                                  nodes {
                                    id
                                    name
                                    childrenCount: objectsByParentId {
                                      totalCount
                                    }
                                    objectsByParentId {
                                      nodes {
                                        id
                                        name
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
                }
              }
            }
          }
        }
      }
    }
  }
`
