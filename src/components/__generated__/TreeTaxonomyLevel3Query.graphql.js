/**
 * This file was generated by:
 *   relay-compiler
 *
 * @providesModule TreeTaxonomyLevel3Query.graphql
 * @generated SignedSource<<5a88e142816f7091c437ba548f057166>>
 * @relayHash 904fd469cb8eff22538020721ac940e7
 * @flow
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type {ConcreteBatch} from 'relay-runtime';

*/


/*
query TreeTaxonomyLevel3Query {
  allDataTypes {
    nodes {
      nameGerman
      name
      propertyCollectionsByDataType {
        totalCount
      }
      relationCollectionsByDataType {
        totalCount
      }
      categoriesByDataType {
        totalCount
        nodes {
          id
          name
          taxonomyByCategory {
            totalCount
            nodes {
              id
              name
              isCategoryStandard
              taxonomyObjectLevel1 {
                totalCount
                nodes {
                  id
                  name
                  taxonomyObjectsByParentId {
                    totalCount
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
*/

const batch /*: ConcreteBatch*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "TreeTaxonomyLevel3Query",
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "args": null,
        "concreteType": "DataTypesConnection",
        "name": "allDataTypes",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "args": null,
            "concreteType": "DataType",
            "name": "nodes",
            "plural": true,
            "selections": [
              {
                "kind": "ScalarField",
                "alias": null,
                "args": null,
                "name": "nameGerman",
                "storageKey": null
              },
              {
                "kind": "ScalarField",
                "alias": null,
                "args": null,
                "name": "name",
                "storageKey": null
              },
              {
                "kind": "LinkedField",
                "alias": null,
                "args": null,
                "concreteType": "PropertyCollectionsConnection",
                "name": "propertyCollectionsByDataType",
                "plural": false,
                "selections": [
                  {
                    "kind": "ScalarField",
                    "alias": null,
                    "args": null,
                    "name": "totalCount",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "kind": "LinkedField",
                "alias": null,
                "args": null,
                "concreteType": "RelationCollectionsConnection",
                "name": "relationCollectionsByDataType",
                "plural": false,
                "selections": [
                  {
                    "kind": "ScalarField",
                    "alias": null,
                    "args": null,
                    "name": "totalCount",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "kind": "LinkedField",
                "alias": null,
                "args": null,
                "concreteType": "CategoriesConnection",
                "name": "categoriesByDataType",
                "plural": false,
                "selections": [
                  {
                    "kind": "ScalarField",
                    "alias": null,
                    "args": null,
                    "name": "totalCount",
                    "storageKey": null
                  },
                  {
                    "kind": "LinkedField",
                    "alias": null,
                    "args": null,
                    "concreteType": "Category",
                    "name": "nodes",
                    "plural": true,
                    "selections": [
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "args": null,
                        "name": "id",
                        "storageKey": null
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "args": null,
                        "name": "name",
                        "storageKey": null
                      },
                      {
                        "kind": "LinkedField",
                        "alias": null,
                        "args": null,
                        "concreteType": "CategoryTaxonomyByCategoryConnection",
                        "name": "taxonomyByCategory",
                        "plural": false,
                        "selections": [
                          {
                            "kind": "ScalarField",
                            "alias": null,
                            "args": null,
                            "name": "totalCount",
                            "storageKey": null
                          },
                          {
                            "kind": "LinkedField",
                            "alias": null,
                            "args": null,
                            "concreteType": "Taxonomy",
                            "name": "nodes",
                            "plural": true,
                            "selections": [
                              {
                                "kind": "ScalarField",
                                "alias": null,
                                "args": null,
                                "name": "id",
                                "storageKey": null
                              },
                              {
                                "kind": "ScalarField",
                                "alias": null,
                                "args": null,
                                "name": "name",
                                "storageKey": null
                              },
                              {
                                "kind": "ScalarField",
                                "alias": null,
                                "args": null,
                                "name": "isCategoryStandard",
                                "storageKey": null
                              },
                              {
                                "kind": "LinkedField",
                                "alias": null,
                                "args": null,
                                "concreteType": "TaxonomyTaxonomyObjectLevel1Connection",
                                "name": "taxonomyObjectLevel1",
                                "plural": false,
                                "selections": [
                                  {
                                    "kind": "ScalarField",
                                    "alias": null,
                                    "args": null,
                                    "name": "totalCount",
                                    "storageKey": null
                                  },
                                  {
                                    "kind": "LinkedField",
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "TaxonomyObject",
                                    "name": "nodes",
                                    "plural": true,
                                    "selections": [
                                      {
                                        "kind": "ScalarField",
                                        "alias": null,
                                        "args": null,
                                        "name": "id",
                                        "storageKey": null
                                      },
                                      {
                                        "kind": "ScalarField",
                                        "alias": null,
                                        "args": null,
                                        "name": "name",
                                        "storageKey": null
                                      },
                                      {
                                        "kind": "LinkedField",
                                        "alias": null,
                                        "args": null,
                                        "concreteType": "TaxonomyObjectsConnection",
                                        "name": "taxonomyObjectsByParentId",
                                        "plural": false,
                                        "selections": [
                                          {
                                            "kind": "ScalarField",
                                            "alias": null,
                                            "args": null,
                                            "name": "totalCount",
                                            "storageKey": null
                                          }
                                        ],
                                        "storageKey": null
                                      }
                                    ],
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query"
  },
  "id": null,
  "kind": "Batch",
  "metadata": {},
  "name": "TreeTaxonomyLevel3Query",
  "query": {
    "argumentDefinitions": [],
    "kind": "Root",
    "name": "TreeTaxonomyLevel3Query",
    "operation": "query",
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "args": null,
        "concreteType": "DataTypesConnection",
        "name": "allDataTypes",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "args": null,
            "concreteType": "DataType",
            "name": "nodes",
            "plural": true,
            "selections": [
              {
                "kind": "ScalarField",
                "alias": null,
                "args": null,
                "name": "nameGerman",
                "storageKey": null
              },
              {
                "kind": "ScalarField",
                "alias": null,
                "args": null,
                "name": "name",
                "storageKey": null
              },
              {
                "kind": "LinkedField",
                "alias": null,
                "args": null,
                "concreteType": "PropertyCollectionsConnection",
                "name": "propertyCollectionsByDataType",
                "plural": false,
                "selections": [
                  {
                    "kind": "ScalarField",
                    "alias": null,
                    "args": null,
                    "name": "totalCount",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "kind": "LinkedField",
                "alias": null,
                "args": null,
                "concreteType": "RelationCollectionsConnection",
                "name": "relationCollectionsByDataType",
                "plural": false,
                "selections": [
                  {
                    "kind": "ScalarField",
                    "alias": null,
                    "args": null,
                    "name": "totalCount",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "kind": "LinkedField",
                "alias": null,
                "args": null,
                "concreteType": "CategoriesConnection",
                "name": "categoriesByDataType",
                "plural": false,
                "selections": [
                  {
                    "kind": "ScalarField",
                    "alias": null,
                    "args": null,
                    "name": "totalCount",
                    "storageKey": null
                  },
                  {
                    "kind": "LinkedField",
                    "alias": null,
                    "args": null,
                    "concreteType": "Category",
                    "name": "nodes",
                    "plural": true,
                    "selections": [
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "args": null,
                        "name": "id",
                        "storageKey": null
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "args": null,
                        "name": "name",
                        "storageKey": null
                      },
                      {
                        "kind": "LinkedField",
                        "alias": null,
                        "args": null,
                        "concreteType": "CategoryTaxonomyByCategoryConnection",
                        "name": "taxonomyByCategory",
                        "plural": false,
                        "selections": [
                          {
                            "kind": "ScalarField",
                            "alias": null,
                            "args": null,
                            "name": "totalCount",
                            "storageKey": null
                          },
                          {
                            "kind": "LinkedField",
                            "alias": null,
                            "args": null,
                            "concreteType": "Taxonomy",
                            "name": "nodes",
                            "plural": true,
                            "selections": [
                              {
                                "kind": "ScalarField",
                                "alias": null,
                                "args": null,
                                "name": "id",
                                "storageKey": null
                              },
                              {
                                "kind": "ScalarField",
                                "alias": null,
                                "args": null,
                                "name": "name",
                                "storageKey": null
                              },
                              {
                                "kind": "ScalarField",
                                "alias": null,
                                "args": null,
                                "name": "isCategoryStandard",
                                "storageKey": null
                              },
                              {
                                "kind": "LinkedField",
                                "alias": null,
                                "args": null,
                                "concreteType": "TaxonomyTaxonomyObjectLevel1Connection",
                                "name": "taxonomyObjectLevel1",
                                "plural": false,
                                "selections": [
                                  {
                                    "kind": "ScalarField",
                                    "alias": null,
                                    "args": null,
                                    "name": "totalCount",
                                    "storageKey": null
                                  },
                                  {
                                    "kind": "LinkedField",
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "TaxonomyObject",
                                    "name": "nodes",
                                    "plural": true,
                                    "selections": [
                                      {
                                        "kind": "ScalarField",
                                        "alias": null,
                                        "args": null,
                                        "name": "id",
                                        "storageKey": null
                                      },
                                      {
                                        "kind": "ScalarField",
                                        "alias": null,
                                        "args": null,
                                        "name": "name",
                                        "storageKey": null
                                      },
                                      {
                                        "kind": "LinkedField",
                                        "alias": null,
                                        "args": null,
                                        "concreteType": "TaxonomyObjectsConnection",
                                        "name": "taxonomyObjectsByParentId",
                                        "plural": false,
                                        "selections": [
                                          {
                                            "kind": "ScalarField",
                                            "alias": null,
                                            "args": null,
                                            "name": "totalCount",
                                            "storageKey": null
                                          }
                                        ],
                                        "storageKey": null
                                      }
                                    ],
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "text": "query TreeTaxonomyLevel3Query {\n  allDataTypes {\n    nodes {\n      nameGerman\n      name\n      propertyCollectionsByDataType {\n        totalCount\n      }\n      relationCollectionsByDataType {\n        totalCount\n      }\n      categoriesByDataType {\n        totalCount\n        nodes {\n          id\n          name\n          taxonomyByCategory {\n            totalCount\n            nodes {\n              id\n              name\n              isCategoryStandard\n              taxonomyObjectLevel1 {\n                totalCount\n                nodes {\n                  id\n                  name\n                  taxonomyObjectsByParentId {\n                    totalCount\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}\n"
};

module.exports = batch;
