# Step Code Part 9 question inventory

Generated from the Part 9 checklist schema. Columns marked **Yes** under Feeds reports are used by the Super Admin compliance report or the characteristics export.

| Question                            | Field type                                          | Feeds reports |
| ----------------------------------- | --------------------------------------------------- | ------------- |
| Stage                               | enum (pre_construction, mid_construction, as_built) | No            |
| Building type                       | enum                                                | Yes           |
| Compliance path                     | enum                                                | Yes           |
| Checklist status                    | enum (draft, complete)                              | No            |
| Energy step achieved                | computed integer                                    | Yes           |
| Zero carbon step achieved           | computed integer                                    | Yes           |
| Compliance outcome                  | computed (pass / fail / incomplete)                 | Yes           |
| Application number                  | export column                                       | No            |
| Jurisdiction                        | export column                                       | Yes           |
| Submission date                     | export column                                       | Yes           |
| Address                             | export column                                       | No            |
| Building type                       | export column                                       | No            |
| Compliance path                     | export column                                       | No            |
| Compliance outcome                  | export column                                       | Yes           |
| Energy step achieved                | export column                                       | Yes           |
| Zero carbon step achieved           | export column                                       | Yes           |
| Dwelling units                      | export column                                       | No            |
| Above grade heated floor area       | export column                                       | No            |
| Below grade heated floor area       | export column                                       | No            |
| Heating degree days                 | export column                                       | No            |
| Air changes per hour                | export column                                       | No            |
| Normalized leakage area             | export column                                       | No            |
| Annual energy consumption           | export column                                       | No            |
| Reference annual energy consumption | export column                                       | No            |
| Building volume                     | export column                                       | No            |
| Building envelope surface area      | export column                                       | No            |
| Electrical consumption              | export column                                       | No            |
| Natural gas consumption             | export column                                       | No            |
| Propane consumption                 | export column                                       | No            |
| Hot water energy                    | export column                                       | No            |
| Software model                      | export column                                       | No            |
| Weather location                    | export column                                       | No            |
| Fossil fuels present                | export column                                       | No            |

Checklist enums: building type, compliance path, and stage are stored as integers with the names above.
Characteristics not captured for a submission are exported as empty cells, never as zero.
