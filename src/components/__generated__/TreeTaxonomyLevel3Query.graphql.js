/**
 * This file was generated by:
 *   relay-compiler
 *
 * @providesModule TreeTaxonomyLevel3Query.graphql
 * @generated SignedSource<<6a03af47fea45f94d2e51518318fdcdb>>
 * @relayHash ff86b19edb1154639d607e27cd0f838a
 * @flow
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type {ConcreteBatch} from 'relay-runtime';

*/


/*
query TreeTaxonomyLevel3Query(
  $categoryname: String
) {
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
          taxonomyByCategory(categoryname: $categoryname) {
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
    "argumentDefinitions": [
      {
        "kind": "LocalArgument",
        "name": "categoryname",
        "type": "String",
        "defaultValue": null
      }
    ],
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
                        "args": [
                          {
                            "kind": "Variable",
                            "name": "categoryname",
                            "variableName": "categoryname",
                            "type": "String"
                          }
                        ],
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
    "argumentDefinitions": [
      {
        "kind": "LocalArgument",
        "name": "categoryname",
        "type": "String",
        "defaultValue": null
      }
    ],
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
                        "args": [
                          {
                            "kind": "Variable",
                            "name": "categoryname",
                            "variableName": "categoryname",
                            "type": "String"
                          }
                        ],
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
  "text": "query TreeTaxonomyLevel3Query(\n  $categoryname: String\n) {\n  allDataTypes {\n    nodes {\n      nameGerman\n      name\n      propertyCollectionsByDataType {\n        totalCount\n      }\n      relationCollectionsByDataType {\n        totalCount\n      }\n      categoriesByDataType {\n        totalCount\n        nodes {\n          id\n          name\n          taxonomyByCategory(categoryname: $categoryname) {\n            totalCount\n            nodes {\n              id\n              name\n              isCategoryStandard\n              taxonomyObjectLevel1 {\n                totalCount\n                nodes {\n                  id\n                  name\n                  taxonomyObjectsByParentId {\n                    totalCount\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}\n"
};

module.exports = batch;
