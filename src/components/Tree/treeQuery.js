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
    $url: [String]
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
    allUsers(orderBy: NAME_ASC) {
      totalCount
      nodes {
        id
        name @include(if: $existsLevel2Benutzer)
        email @include(if: $existsLevel2Benutzer)
        organizationUsersByUserId @include(if: $existsLevel2Benutzer) {
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
    treeFunction(url: $url) {
      nodes {
        level
        label
        id
        url
        sort
        childrenCount
        info
        menuType
      }
    }
    allPropertyCollections(orderBy: NAME_ASC) {
      totalCount
      nodes {
        id
        name @include(if: $existsLevel2Pc)
        propertyCollectionObjectsByPropertyCollectionId
          @include(if: $existsLevel2Pc) {
          totalCount
        }
        relationsByPropertyCollectionId @include(if: $existsLevel2Pc) {
          totalCount
        }
      }
    }
    artTaxonomies: allTaxonomies(
      filter: { type: { equalTo: ART } }
      orderBy: NAME_ASC
    ) {
      totalCount
      # beware: not including node id's makes apollo loose cache...
      nodes {
        id
        name @include(if: $existsArtenTaxonomies)
        type @include(if: $existsArtenTaxonomies)
        objectsByTaxonomyId @include(if: $existsArtenTaxonomies) {
          totalCount
        }
        topLevelObjects: objectsByTaxonomyId(
          filter: { parentId: { isNull: true } }
        ) @include(if: $existsArtenTaxonomies) {
          totalCount
        }
      }
    }
    lrTaxonomies: allTaxonomies(
      filter: { type: { equalTo: LEBENSRAUM } }
      orderBy: NAME_ASC
    ) {
      totalCount
      # beware: not including node id's makes apollo loose cache...
      nodes {
        id
        name @include(if: $existsLrTaxonomies)
        type @include(if: $existsLrTaxonomies)
        objectsByTaxonomyId @include(if: $existsLrTaxonomies) {
          totalCount
        }
        topLevelObjects: objectsByTaxonomyId(
          filter: { parentId: { isNull: true } }
        ) @include(if: $existsLrTaxonomies) {
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
