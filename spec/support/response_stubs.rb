SIGNATURE_RESPONSE_STUB = [
  {
    "result" => "SUCCESS",
    "integrity" => true,
    "signatureTimestamp" => {
      "date" => "2022-10-20T14:01:03.000Z",
      "signatureResult" => {
        "result" => "SUCCESS",
        "integrity" => true,
        "signatureTimestamp" => {
          "date" => "2022-10-20T14:01:03.000Z",
          "result" => "SUCCESS",
          "valid" => true,
          "signed" => false
        },
        "signerStatus" => {
          "trust" => "VALID",
          "validity" => "VALID",
          "certificateInfo" => {
            "subjectName" =>
              "C=CA,O=CertifiO - Org - AATL,OU=Solutions Notarius,UID=TSA01+CN=Timestamp Authority -- Notarius",
            "commonName" => "Timestamp Authority -- Notarius",
            "issuer" => {
              "trust" => "VALID",
              "validity" => "VALID",
              "certificateInfo" => {
                "subjectName" =>
                  "C=CA,O=Notarius Inc,CN=Notarius Certificate Authority",
                "commonName" => "Notarius Certificate Authority",
                "issuer" => {
                  "trust" => "VALID",
                  "validity" => "VALID",
                  "certificateInfo" => {
                    "subjectName" =>
                      "C=CA,O=Notarius Inc,CN=Notarius Root Certificate Authority",
                    "commonName" => "Notarius Root Certificate Authority"
                  },
                  "result" => "SUCCESS"
                }
              },
              "revocationInfo" => {
                "source" => "ONLINE",
                "type" => "CRL",
                "signatureResult" => {
                  "result" => "SUCCESS",
                  "integrity" => true,
                  "signatureTimestamp" => {
                    "date" => "2023-12-07T15:53:18.000Z",
                    "result" => "SUCCESS",
                    "valid" => true,
                    "signed" => false
                  },
                  "signerStatus" => {
                    "trust" => "VALID",
                    "validity" => "VALID",
                    "certificateInfo" => {
                      "subjectName" =>
                        "CN=Notarius Root Certificate Authority, O=Notarius Inc, C=CA",
                      "commonName" => "Notarius Root Certificate Authority"
                    },
                    "result" => "SUCCESS"
                  }
                }
              },
              "result" => "SUCCESS"
            }
          },
          "revocationInfo" => {
            "source" => "ONLINE",
            "type" => "OCSP",
            "signatureResult" => {
              "result" => "SUCCESS",
              "integrity" => true,
              "signatureTimestamp" => {
                "date" => "2024-01-16T17:12:29.000Z",
                "result" => "SUCCESS",
                "valid" => true,
                "signed" => false
              },
              "signerStatus" => {
                "trust" => "VALID",
                "validity" => "NO_REVOCATION_CHECK",
                "certificateInfo" => {
                  "subjectName" =>
                    "C=CA,O=CertifiO - Org - AATL,OU=Solutions Notarius,CN=OCSP Responder 1+UID=ocsp@notarius.com",
                  "commonName" => "OCSP Responder 1"
                },
                "result" => "SUCCESS"
              }
            }
          },
          "result" => "SUCCESS"
        }
      },
      "result" => "SUCCESS",
      "valid" => true,
      "signed" => true
    },
    "signerStatus" => {
      "trust" => "VALID",
      "validity" => "VALID",
      "certificateInfo" => {
        "subjectName" =>
          "C=CA,O=CertifiO Test - AATL,OU=Solutions Notarius,UID=h2test+CN=Test - H2 -- Notarius",
        "commonName" => "Test - H2 -- Notarius",
        "issuer" => {
          "trust" => "VALID",
          "validity" => "VALID",
          "certificateInfo" => {
            "subjectName" =>
              "C=CA,O=Notarius Inc,CN=Notarius Certificate Authority",
            "commonName" => "Notarius Certificate Authority",
            "issuer" => {
              "trust" => "VALID",
              "validity" => "VALID",
              "certificateInfo" => {
                "subjectName" =>
                  "C=CA,O=Notarius Inc,CN=Notarius Root Certificate Authority",
                "commonName" => "Notarius Root Certificate Authority"
              },
              "result" => "SUCCESS"
            }
          },
          "revocationInfo" => {
            "source" => "EMBEDDED",
            "type" => "CRL",
            "signatureResult" => {
              "result" => "SUCCESS",
              "integrity" => true,
              "signatureTimestamp" => {
                "date" => "2022-09-28T13:06:19.000Z",
                "result" => "SUCCESS",
                "valid" => true,
                "signed" => false
              },
              "signerStatus" => {
                "trust" => "VALID",
                "validity" => "VALID",
                "certificateInfo" => {
                  "subjectName" =>
                    "C=CA,O=Notarius Inc,CN=Notarius Root Certificate Authority",
                  "commonName" => "Notarius Root Certificate Authority"
                },
                "result" => "SUCCESS"
              }
            }
          },
          "result" => "SUCCESS"
        }
      },
      "revocationInfo" => {
        "source" => "EMBEDDED",
        "type" => "OCSP",
        "signatureResult" => {
          "result" => "SUCCESS",
          "integrity" => true,
          "signatureTimestamp" => {
            "date" => "2022-10-20T10:48:12.000Z",
            "result" => "SUCCESS",
            "valid" => true,
            "signed" => false
          },
          "signerStatus" => {
            "trust" => "VALID",
            "validity" => "NO_REVOCATION_CHECK",
            "certificateInfo" => {
              "subjectName" =>
                "C=CA,O=CertifiO - Org - AATL,OU=Solutions Notarius,CN=Notarius OCSP Responder+UID=ocsp@notarius.com",
              "commonName" => "Notarius OCSP Responder"
            },
            "result" => "SUCCESS"
          }
        }
      },
      "result" => "SUCCESS"
    },
    "revision" => 1,
    "signatureFieldName" => "Signature1",
    "pageNumber" => 1,
    "signatureReason" => "",
    "propBuildAppInfo" => {
      "name" => "/Test#20LSA#20-#20XML#20directory#20signature",
      "os" => ["/Windows#2010"],
      "trustedMode" => true
    },
    "ltvenabled" => true
  }
]
