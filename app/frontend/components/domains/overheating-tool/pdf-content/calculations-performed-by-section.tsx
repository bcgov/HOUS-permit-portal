import { Text, View } from "@react-pdf/renderer"
import React from "react"
import { useTranslation } from "react-i18next"
import { pdfStyles as styles } from "../shared-pdf-styles"

interface CalculationsPerformedBySectionProps {
  formJson: any
  prefix: string
}

export const CalculationsPerformedBySection: React.FC<CalculationsPerformedBySectionProps> = ({ formJson, prefix }) => {
  const { t } = useTranslation() as any

  const fields = [
    [t(`${prefix}.pdfContent.calculationsPerformedByName`), formJson.calculationPerformedBy?.name || "", 55],
    [t(`${prefix}.pdfContent.calculationsPerformedByCompany`), formJson.calculationPerformedBy?.company || "", 56],
    [t(`${prefix}.pdfContent.calculationsPerformedByAddress`), formJson.calculationPerformedBy?.address || "", 57],
    [t(`${prefix}.pdfContent.calculationsPerformedByCityAndProvince`), formJson.calculationPerformedBy?.city || "", 58],
    [
      t(`${prefix}.pdfContent.calculationsPerformedByPostalCode`),
      formJson.calculationPerformedBy?.postalCode || "",
      59,
    ],
    [t(`${prefix}.pdfContent.calculationsPerformedByPhone`), formJson.calculationPerformedBy?.phone || "", 60],
    [t(`${prefix}.pdfContent.calculationsPerformedByFax`), formJson.calculationPerformedBy?.fax || "", 61],
    [t(`${prefix}.pdfContent.calculationsPerformedByEmail`), formJson.calculationPerformedBy?.email || "", 62],
  ]

  return (
    <>
      <Text style={[styles.sectionHeader, { paddingLeft: "220pt" }]}>
        {t(`${prefix}.pdfContent.calculationsPerformedBy`)}
      </Text>
      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 1, border: "1pt solid black", borderTop: "none", borderRight: "none" }}>
          <View>
            {fields.map(([label, value, fieldNumber], index, arr) => (
              <View
                key={label as string}
                style={[
                  { flexDirection: "row", marginBottom: 2, padding: 5, paddingLeft: 0 },
                  index !== arr.length - 1 && { borderBottom: "1pt solid black" },
                ]}
              >
                <Text style={{ fontSize: 6 }}>{label}</Text>
                <Text style={{ fontSize: 6, flex: 1 }}> {value}</Text>
                <View style={{ position: "absolute", right: "4pt", top: "10pt" }}>
                  <Text style={styles.fieldNumber}>{fieldNumber}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ flex: 1, border: "1pt solid black", borderTop: "none", borderRight: "none" }}>
          <View style={{ padding: 5, position: "relative" }}>
            <View
              style={{
                transform: "rotate(-35deg)",
                position: "absolute",
                top: 80,
                left: 5,
                color: "blue",
                fontSize: 9,
              }}
            >
              <Text>{t(`${prefix}.pdfContent.designersSignatureStampDigitalOrOtherCertificationMark`)}</Text>
            </View>
            <View style={{ position: "absolute", right: "1pt", top: "156pt" }}>
              <Text style={styles.fieldNumber}>68</Text>
            </View>
          </View>
        </View>

        <View style={{ flex: 1, border: "1pt solid black", borderTop: "none" }}>
          <View>
            <Text style={{ fontSize: 7, marginTop: 10, marginLeft: 2, textDecoration: "underline" }}>
              {t(`${prefix}.pdfContent.attestation`)} {formJson.calculationPerformedBy?.attestation || ""}
            </Text>
            <Text style={{ fontSize: 7, marginTop: 5, marginLeft: 2 }}>
              {t(`${prefix}.pdfContent.attestationHelpText`)}
            </Text>
            <View style={{ width: "180pt", position: "absolute", right: "1pt", top: "8pt" }}>
              <Text style={styles.fieldNumber}>63</Text>
            </View>
            <Text style={{ fontSize: 6, paddingBottom: 2, paddingTop: 5, paddingLeft: 2 }}>
              {t(`${prefix}.pdfContent.accreditation`)}
            </Text>
            <View style={{ position: "relative" }}>
              <Text
                style={{
                  fontSize: 6,
                  paddingBottom: 5,
                  paddingTop: 2,
                  borderBottom: "1pt solid black",
                  paddingLeft: 2,
                }}
              >
                {t(`${prefix}.pdfContent.accreditationReference1`)}: {formJson.calculationPerformedBy?.reference1 || ""}
              </Text>
              <View style={{ width: "180pt", position: "absolute", right: "1pt", top: "8pt" }}>
                <Text style={styles.fieldNumber}>64</Text>
              </View>
            </View>
            <Text style={{ fontSize: 6, paddingBottom: 2, paddingTop: 5, paddingLeft: 2 }}>
              {t(`${prefix}.pdfContent.accreditation`)}
            </Text>
            <View style={{ position: "relative" }}>
              <Text
                style={{
                  fontSize: 6,
                  paddingBottom: 5,
                  paddingTop: 2,
                  borderBottom: "1pt solid black",
                  paddingLeft: 2,
                }}
              >
                {t(`${prefix}.pdfContent.accreditationReference2`)}: {formJson.calculationPerformedBy?.reference2 || ""}
              </Text>
              <View style={{ width: "180pt", position: "absolute", right: "1pt", top: "8pt" }}>
                <Text style={styles.fieldNumber}>65</Text>
              </View>
            </View>
            <View style={{ position: "relative" }}>
              <Text style={{ fontSize: 6, paddingBottom: 2, paddingTop: 5, paddingLeft: 2 }}>
                {t(`${prefix}.pdfContent.issuedForDate`)}{" "}
                {formJson.calculationPerformedBy?.issuedForDate
                  ? new Date(formJson.calculationPerformedBy.issuedForDate).toLocaleDateString()
                  : ""}
              </Text>
              <View style={{ width: "180pt", position: "absolute", right: "1pt", top: "8pt" }}>
                <Text style={styles.fieldNumber}>66</Text>
              </View>
            </View>
            <Text
              style={{
                fontSize: 6,
                paddingBottom: 5,
                paddingTop: 2,
                borderBottom: "1pt solid black",
                paddingLeft: 2,
              }}
            ></Text>
            <Text style={{ fontSize: 6, paddingBottom: 2, paddingTop: 5, paddingLeft: 2 }}>
              {t(`${prefix}.pdfContent.issuedForDate2`)}{" "}
              {formJson.calculationPerformedBy?.issuedForDate2
                ? new Date(formJson.calculationPerformedBy.issuedForDate2).toLocaleDateString()
                : ""}
            </Text>
            <View style={{ width: "180pt", position: "relative", right: "-2pt", top: "7pt" }}>
              <Text style={styles.fieldNumber}>67</Text>
            </View>
            <Text
              style={{
                fontSize: 6,
                paddingBottom: 5,
                paddingTop: 2,
                borderBottom: "1pt solid black",
                paddingLeft: 2,
              }}
            ></Text>
            <Text style={{ fontSize: 7, fontWeight: "bold", textAlign: "center", marginTop: 2, marginBottom: 2 }}>
              {t(`${prefix}.pdfContent.page`)}
            </Text>
          </View>
        </View>
      </View>
    </>
  )
}
