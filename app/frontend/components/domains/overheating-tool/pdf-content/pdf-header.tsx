import { Text, View } from "@react-pdf/renderer"
import React from "react"
import { useTranslation } from "react-i18next"
import { pdfStyles as styles } from "../shared-pdf-styles"

interface PDFHeaderProps {
  formJson: any
  prefix: string
}

export const PDFHeader: React.FC<PDFHeaderProps> = ({ formJson, prefix }) => {
  const { t } = useTranslation() as any

  return (
    <View style={styles.headerTable}>
      <View style={[styles.headerRow, { padding: 0 }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { fontWeight: "bold", marginLeft: 86, letterSpacing: 0.1 }]}>
            {t(`${prefix}.pdfContent.title`)}
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { paddingTop: "2pt", marginLeft: "57pt", letterSpacing: 0.1, paddingBottom: "2pt" },
            ]}
          >
            {t(`${prefix}.pdfContent.helpText`)}
          </Text>
        </View>
        <View style={[styles.headerRight, { backgroundColor: "#c0c0c0", paddingTop: "5pt" }]}>
          <Text style={{ fontSize: "7pt", fontWeight: "normal", paddingLeft: "31pt", margin: 0 }}>
            {t(`${prefix}.pdfContent.CSAF28012`)}
          </Text>
          <Text
            style={{
              fontSize: "7pt",
              fontWeight: "normal",
              lineHeight: 0.5,
              paddingLeft: "21pt",
              marginTop: "1.5pt",
            }}
          >
            {t(`${prefix}.pdfContent.setVer`)}
          </Text>
        </View>
      </View>
      <View style={[styles.headerRow, { minHeight: "35pt" }]}>
        <View style={styles.headerLeftNoBg}>
          <Text
            style={{
              fontSize: "6pt",
              paddingTop: "4pt",
              fontWeight: "bold",
              letterSpacing: 0,
              fontFamily: "Helvetica",
            }}
          >
            {t(`${prefix}.pdfContent.theseDocumentsIssuedForTheUseOf`)}{" "}
            <Text style={{ textDecoration: "underline", paddingTop: "10pt" }}>{formJson.drawingIssueFor || ""}</Text>
          </Text>
          <Text
            style={{
              fontSize: "6pt",
              paddingTop: "5pt",
              marginTop: "5pt",
              marginLeft: "40pt",
              fontWeight: "bold",
              letterSpacing: 0,
              fontFamily: "Helvetica",
            }}
          >
            {t(`${prefix}.pdfContent.andMayNotBeUsedByAnyOtherPersonsWithoutAuthorization`)}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "flex-end" }}>
            <Text style={styles.fieldNumber}>1</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: "6pt",
              textTransform: "uppercase",
              marginLeft: "35pt",
              letterSpacing: 0,
              fontFamily: "Helvetica",
            }}
          >
            {t(`${prefix}.pdfContent.projectNumber`)}
          </Text>
          <View style={{ minHeight: 15, paddingLeft: 2 }}>
            <Text style={{ fontSize: "6pt", marginLeft: "35pt" }}>{formJson.projectNumber || ""}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: "7pt" }}>
            <Text style={styles.fieldNumber}>2</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
