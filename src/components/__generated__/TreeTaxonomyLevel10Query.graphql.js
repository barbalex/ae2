/**
 * This file was generated by:
 *   relay-compiler
 *
 * @providesModule TreeTaxonomyLevel10Query.graphql
 * @generated SignedSource<<76850f75f436fbdc20c55d63ffca097b>>
 * @relayHash c908457ef934f6f8452e5b35e9d6724e
 * @flow
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type {ConcreteBatch} from 'relay-runtime';

*/


/*
query TreeTaxonomyLevel10Query(
  $level10: Uuid!
) {
  taxonomyObjectById(id: $level10) {
    taxonomyObjectsByParentId {
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
*/

const batch /*: ConcreteBatch*/ = {
  "fragment": {
    "argumentDefinitions": [
      {
        "kind": "LocalArgument",
        "name": "level10",
        "type": "Uuid!",
        "defaultValue": null
      }
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "TreeTaxonomyLevel10Query",
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "id",
            "variableName": "level10",
            "type": "Uuid!"
          }
        ],
        "concreteType": "TaxonomyObject",
        "name": "taxonomyObjectById",
        "plural": false,
        "selections": [
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
    "type": "Query"
  },
  "id": null,
  "kind": "Batch",
  "metadata": {},
  "name": "TreeTaxonomyLevel10Query",
  "query": {
    "argumentDefinitions": [
      {
        "kind": "LocalArgument",
        "name": "level10",
        "type": "Uuid!",
        "defaultValue": null
      }
    ],
    "kind": "Root",
    "name": "TreeTaxonomyLevel10Query",
    "operation": "query",
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "id",
            "variableName": "level10",
            "type": "Uuid!"
          }
        ],
        "concreteType": "TaxonomyObject",
        "name": "taxonomyObjectById",
        "plural": false,
        "selections": [
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
    ]
  },
  "text": "query TreeTaxonomyLevel10Query(\n  $level10: Uuid!\n) {\n  taxonomyObjectById(id: $level10) {\n    taxonomyObjectsByParentId {\n      totalCount\n      nodes {\n        id\n        name\n        taxonomyObjectsByParentId {\n          totalCount\n        }\n      }\n    }\n  }\n}\n"
};

module.exports = batch;
