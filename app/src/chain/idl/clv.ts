/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/clv.json`.
 */
export type Clv = {
  "address": "734ZWmPmAMGSjCshLCJQRpPNiaWBQsdaZDkvP3MAGmLz",
  "metadata": {
    "name": "clv",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "initializeConfig",
      "discriminator": [
        208,
        127,
        21,
        1,
        194,
        190,
        196,
        70
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "openPrediction",
      "discriminator": [
        133,
        18,
        105,
        142,
        96,
        107,
        224,
        203
      ],
      "accounts": [
        {
          "name": "predictor",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "prediction",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  100,
                  105,
                  99,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "predictor"
              },
              {
                "kind": "arg",
                "path": "id"
              }
            ]
          }
        },
        {
          "name": "dailyOddsMerkleRoots"
        },
        {
          "name": "txoracleProgram",
          "address": "6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "u64"
        },
        {
          "name": "fixtureId",
          "type": "i64"
        },
        {
          "name": "market",
          "type": {
            "defined": {
              "name": "marketKind"
            }
          }
        },
        {
          "name": "selection",
          "type": "u8"
        },
        {
          "name": "lineX10",
          "type": "i16"
        },
        {
          "name": "priceIndex",
          "type": "u8"
        },
        {
          "name": "entryTs",
          "type": "i64"
        },
        {
          "name": "odds",
          "type": {
            "defined": {
              "name": "odds"
            }
          }
        },
        {
          "name": "summary",
          "type": {
            "defined": {
              "name": "oddsBatchSummary"
            }
          }
        },
        {
          "name": "subTreeProof",
          "type": {
            "vec": {
              "defined": {
                "name": "proofNode"
              }
            }
          }
        },
        {
          "name": "mainTreeProof",
          "type": {
            "vec": {
              "defined": {
                "name": "proofNode"
              }
            }
          }
        }
      ]
    },
    {
      "name": "settleClose",
      "discriminator": [
        151,
        229,
        199,
        24,
        177,
        153,
        171,
        49
      ],
      "accounts": [
        {
          "name": "settler",
          "writable": true,
          "signer": true
        },
        {
          "name": "prediction",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  100,
                  105,
                  99,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "prediction.predictor",
                "account": "prediction"
              },
              {
                "kind": "account",
                "path": "prediction.id",
                "account": "prediction"
              }
            ]
          }
        },
        {
          "name": "dailyOddsMerkleRoots"
        },
        {
          "name": "txoracleProgram",
          "address": "6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J"
        }
      ],
      "args": [
        {
          "name": "closeTs",
          "type": "i64"
        },
        {
          "name": "priceIndex",
          "type": "u8"
        },
        {
          "name": "odds",
          "type": {
            "defined": {
              "name": "odds"
            }
          }
        },
        {
          "name": "summary",
          "type": {
            "defined": {
              "name": "oddsBatchSummary"
            }
          }
        },
        {
          "name": "subTreeProof",
          "type": {
            "vec": {
              "defined": {
                "name": "proofNode"
              }
            }
          }
        },
        {
          "name": "mainTreeProof",
          "type": {
            "vec": {
              "defined": {
                "name": "proofNode"
              }
            }
          }
        }
      ]
    },
    {
      "name": "settleOutcome",
      "discriminator": [
        204,
        183,
        148,
        170,
        112,
        151,
        178,
        121
      ],
      "accounts": [
        {
          "name": "settler",
          "writable": true,
          "signer": true
        },
        {
          "name": "prediction",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  100,
                  105,
                  99,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "prediction.predictor",
                "account": "prediction"
              },
              {
                "kind": "account",
                "path": "prediction.id",
                "account": "prediction"
              }
            ]
          }
        },
        {
          "name": "dailyScoresMerkleRoots"
        },
        {
          "name": "txoracleProgram",
          "address": "6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J"
        }
      ],
      "args": [
        {
          "name": "ts",
          "type": "i64"
        },
        {
          "name": "fixtureSummary",
          "type": {
            "defined": {
              "name": "scoresBatchSummary"
            }
          }
        },
        {
          "name": "fixtureProof",
          "type": {
            "vec": {
              "defined": {
                "name": "proofNode"
              }
            }
          }
        },
        {
          "name": "mainTreeProof",
          "type": {
            "vec": {
              "defined": {
                "name": "proofNode"
              }
            }
          }
        },
        {
          "name": "statA",
          "type": {
            "defined": {
              "name": "statTerm"
            }
          }
        },
        {
          "name": "statB",
          "type": {
            "option": {
              "defined": {
                "name": "statTerm"
              }
            }
          }
        }
      ]
    },
    {
      "name": "voidPrediction",
      "discriminator": [
        178,
        11,
        223,
        122,
        135,
        194,
        16,
        235
      ],
      "accounts": [
        {
          "name": "predictor",
          "writable": true,
          "signer": true,
          "relations": [
            "prediction"
          ]
        },
        {
          "name": "prediction",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  100,
                  105,
                  99,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "predictor"
              },
              {
                "kind": "account",
                "path": "prediction.id",
                "account": "prediction"
              }
            ]
          }
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "config",
      "discriminator": [
        155,
        12,
        170,
        224,
        30,
        250,
        204,
        130
      ]
    },
    {
      "name": "prediction",
      "discriminator": [
        98,
        127,
        141,
        187,
        218,
        33,
        8,
        14
      ]
    }
  ],
  "events": [
    {
      "name": "predictionClosed",
      "discriminator": [
        166,
        86,
        249,
        29,
        59,
        215,
        25,
        26
      ]
    },
    {
      "name": "predictionOpened",
      "discriminator": [
        16,
        202,
        75,
        82,
        218,
        107,
        148,
        47
      ]
    },
    {
      "name": "predictionSettled",
      "discriminator": [
        8,
        117,
        33,
        63,
        201,
        197,
        58,
        208
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "oddsProofRejected",
      "msg": "Odds proof rejected by txoracle"
    },
    {
      "code": 6001,
      "name": "statProofRejected",
      "msg": "Stat proof rejected by txoracle"
    },
    {
      "code": 6002,
      "name": "fixtureMismatch",
      "msg": "Odds record fixture does not match prediction"
    },
    {
      "code": 6003,
      "name": "timestampMismatch",
      "msg": "Record timestamp does not match argument"
    },
    {
      "code": 6004,
      "name": "invalidMarket",
      "msg": "Invalid market kind"
    },
    {
      "code": 6005,
      "name": "invalidSelection",
      "msg": "Invalid selection for market"
    },
    {
      "code": 6006,
      "name": "invalidPriceIndex",
      "msg": "Invalid price index"
    },
    {
      "code": 6007,
      "name": "invalidPrice",
      "msg": "Price must be positive"
    },
    {
      "code": 6008,
      "name": "statKeyMismatch",
      "msg": "Stat key does not match prediction terms"
    },
    {
      "code": 6009,
      "name": "missingSecondStat",
      "msg": "Second stat required for this market"
    },
    {
      "code": 6010,
      "name": "badState",
      "msg": "Prediction is not in the required state"
    },
    {
      "code": 6011,
      "name": "overflow",
      "msg": "Arithmetic overflow"
    }
  ],
  "types": [
    {
      "name": "config",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "txoracleProgram",
            "type": "pubkey"
          },
          {
            "name": "predictionCount",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "marketKind",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "result1x2"
          },
          {
            "name": "totalsOu"
          }
        ]
      }
    },
    {
      "name": "odds",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fixtureId",
            "type": "i64"
          },
          {
            "name": "messageId",
            "type": "string"
          },
          {
            "name": "ts",
            "type": "i64"
          },
          {
            "name": "bookmaker",
            "type": "string"
          },
          {
            "name": "bookmakerId",
            "type": "i32"
          },
          {
            "name": "superOddsType",
            "type": "string"
          },
          {
            "name": "gameState",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "inRunning",
            "type": "bool"
          },
          {
            "name": "marketParameters",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "marketPeriod",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "priceNames",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "prices",
            "type": {
              "vec": "i32"
            }
          }
        ]
      }
    },
    {
      "name": "oddsBatchSummary",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fixtureId",
            "type": "i64"
          },
          {
            "name": "updateStats",
            "type": {
              "defined": {
                "name": "oddsUpdateStats"
              }
            }
          },
          {
            "name": "oddsSubTreeRoot",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "oddsUpdateStats",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "updateCount",
            "type": "u32"
          },
          {
            "name": "minTimestamp",
            "type": "i64"
          },
          {
            "name": "maxTimestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "predStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "open"
          },
          {
            "name": "entryProven"
          },
          {
            "name": "closed"
          },
          {
            "name": "settled"
          },
          {
            "name": "void"
          }
        ]
      }
    },
    {
      "name": "prediction",
      "docs": [
        "A single CLV prediction. Entry/close implied probabilities and the outcome",
        "are all written only after a txoracle Merkle proof verifies."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "predictor",
            "type": "pubkey"
          },
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "fixtureId",
            "type": "i64"
          },
          {
            "name": "market",
            "type": {
              "defined": {
                "name": "marketKind"
              }
            }
          },
          {
            "name": "selection",
            "type": "u8"
          },
          {
            "name": "lineX10",
            "type": "i16"
          },
          {
            "name": "statAKey",
            "type": "u32"
          },
          {
            "name": "statBKey",
            "type": "u32"
          },
          {
            "name": "opAdd",
            "type": "bool"
          },
          {
            "name": "comparison",
            "type": "u8"
          },
          {
            "name": "threshold",
            "type": "i32"
          },
          {
            "name": "entryTs",
            "type": "i64"
          },
          {
            "name": "entryProbBps",
            "type": "u32"
          },
          {
            "name": "closeTs",
            "type": "i64"
          },
          {
            "name": "closeProbBps",
            "type": "u32"
          },
          {
            "name": "clvBps",
            "type": "i32"
          },
          {
            "name": "outcomeWin",
            "type": "bool"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "predStatus"
              }
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "settledAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "predictionClosed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "predictor",
            "type": "pubkey"
          },
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "closeProbBps",
            "type": "u32"
          },
          {
            "name": "clvBps",
            "type": "i32"
          }
        ]
      }
    },
    {
      "name": "predictionOpened",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "predictor",
            "type": "pubkey"
          },
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "fixtureId",
            "type": "i64"
          },
          {
            "name": "entryProbBps",
            "type": "u32"
          },
          {
            "name": "entryTs",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "predictionSettled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "predictor",
            "type": "pubkey"
          },
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "outcomeWin",
            "type": "bool"
          },
          {
            "name": "clvBps",
            "type": "i32"
          },
          {
            "name": "entryProbBps",
            "type": "u32"
          },
          {
            "name": "closeProbBps",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "proofNode",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "hash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "isRightSibling",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "scoreStat",
      "docs": [
        "The on-chain representation of a single, provable key-value statistic.",
        "This is the leaf of the inner-most Merkle tree."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "key",
            "type": "u32"
          },
          {
            "name": "value",
            "type": "i32"
          },
          {
            "name": "period",
            "type": "i32"
          }
        ]
      }
    },
    {
      "name": "scoresBatchSummary",
      "docs": [
        "The summary for a single fixture's scores events within a 5-minute batch.",
        "This contains the root of the sub-tree of all events for that fixture."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fixtureId",
            "type": "i64"
          },
          {
            "name": "updateStats",
            "type": {
              "defined": {
                "name": "scoresUpdateStats"
              }
            }
          },
          {
            "name": "eventsSubTreeRoot",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "scoresUpdateStats",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "updateCount",
            "type": "i32"
          },
          {
            "name": "minTimestamp",
            "type": "i64"
          },
          {
            "name": "maxTimestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "statTerm",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "statToProve",
            "type": {
              "defined": {
                "name": "scoreStat"
              }
            }
          },
          {
            "name": "eventStatRoot",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "statProof",
            "type": {
              "vec": {
                "defined": {
                  "name": "proofNode"
                }
              }
            }
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "configSeed",
      "type": "bytes",
      "value": "[99, 111, 110, 102, 105, 103]"
    },
    {
      "name": "predictionSeed",
      "type": "bytes",
      "value": "[112, 114, 101, 100, 105, 99, 116, 105, 111, 110]"
    }
  ]
};
