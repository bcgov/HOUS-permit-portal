import { Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer"
import React from "react"
import { useTranslation } from "react-i18next"

interface PDFComponentProps {
  data: any
  assetDirectoryPath: string
}

export const SingleZoneCoolingHeatingRoomByRoomContent: React.FC<PDFComponentProps> = ({
  data,
  assetDirectoryPath,
}) => {
  const formJson = data.formJson || {}
  const { t } = useTranslation()
  const prefix = "singleZoneCoolingHeatingTool.pdfContent.roomByRoomCalculationResults"
  const logoPath = `${assetDirectoryPath}/images/f280/hvac-designers-of-canada-logo.png`

  const roomData = Array.from({ length: 39 }, (_, index) => ({
    number: index + 1,
    name: "",
    heating: "",
    cooling: "",
  }))

  const styles = StyleSheet.create({
    page: {
      fontFamily: "Helvetica",
      fontSize: 9,
      padding: 25,
      paddingTop: 20,
      paddingBottom: 15,
      backgroundColor: "white",
    },

    headerTable: {
      border: "1pt solid black",
      borderBottom: "none",
      marginBottom: 0,
    },
    headerRow: {
      flexDirection: "row",
      borderBottom: "1pt solid black",
    },
    headerLeft: {
      flex: 4,
      backgroundColor: "#c0c0c0",
      borderRight: "1pt solid black",
      justifyContent: "center",
    },
    headerLeftNoBg: {
      flex: 4,
      borderRight: "1pt solid black",
      justifyContent: "center",
    },
    headerRight: {
      flex: 1,
      textAlign: "center",
      fontSize: 8,
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: 14.5,
      fontFamily: "Times-Roman",
      fontWeight: "bold",
      textAlign: "center",
    },
    headerSubtitle: {
      fontSize: 7,
      textAlign: "center",
      lineHeight: 1.2,
    },

    // Section headers
    sectionHeader: {
      backgroundColor: "#c0c0c0",
      border: "1pt solid black",
      borderTop: "none",
      fontFamily: "Times-Roman",
      fontSize: 10,
      fontWeight: "bold",
      textAlign: "center",
      textTransform: "uppercase",
      marginTop: 0,
    },

    // Form sections
    formSection: {
      border: "1pt solid black",
      borderTop: "none",
      borderBottom: "none",
    },
    formRow: {
      flexDirection: "row",
      borderBottom: "1pt solid black",
      alignItems: "center",
    },
    formRowLast: {
      flexDirection: "row",
      alignItems: "center",
    },

    // Field styles
    fieldLabel: {
      paddingBottom: 3,
      fontSize: 9,
      justifyContent: "flex-start",
      alignItems: "flex-start",
    },
    fieldValue: {
      paddingLeft: 2,
      fontSize: 9,
      paddingTop: 1,
      paddingBottom: 3,
      flex: 1,
      justifyContent: "flex-start",
      alignItems: "flex-start",
      minHeight: 18,
    },
    fieldValueBorder: {
      padding: 4,
      fontSize: 9,
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      borderRight: "1pt solid black",
      minHeight: 18,
    },

    // Checkbox styles
    checkbox: {
      width: 10,
      height: 10,
      border: "1pt solid black",
      marginRight: 4,
      marginLeft: 2,
      textAlign: "center",
      fontSize: 7,
      justifyContent: "center",
      alignItems: "center",
    },
    checkboxChecked: {
      width: 10,
      height: 10,
      border: "1pt solid black",
      marginRight: 4,
      marginLeft: 2,
      textAlign: "center",
      fontSize: 7,
      backgroundColor: "black",
      color: "white",
      justifyContent: "center",
      alignItems: "center",
    },

    // Footer styles
    footerSection: {
      marginTop: 20,
      border: "1pt solid black",
    },
    footerRow: {
      flexDirection: "row",
      borderBottom: "1pt solid black",
      minHeight: 80,
    },
    footerLabel: {
      width: 60,
      padding: 3,
      fontSize: 8,
      borderRight: "1pt solid black",
      backgroundColor: "#f5f5f5",
    },
    footerValue: {
      flex: 1,
      padding: 3,
      fontSize: 8,
    },

    // Signature section
    signatureSection: {
      flexDirection: "row",
      marginTop: 5,
      border: "1pt solid black",
      minHeight: 80,
    },
    signatureLeft: {
      flex: 1,
      padding: 8,
      borderRight: "1pt solid black",
      position: "relative",
    },
    signatureRight: {
      flex: 1,
      padding: 8,
    },

    // Bottom section
    bottomSection: {
      flexDirection: "row",
      alignItems: "stretch",
    },
    bottomLeft: {
      border: "1pt solid black",
      padding: 8,
      textAlign: "center",
      fontSize: 9,
      fontWeight: "bold",
      color: "blue",
      justifyContent: "center",
      alignItems: "center",
      minHeight: 40,
      width: 410,
      borderTop: "none",
    },
    bottomRight: {
      border: "1pt solid black",
      width: 165,
      borderTop: "none",
      borderLeft: "none",
      textAlign: "center",
      justifyContent: "center",
      alignItems: "center",
    },

    // Input field styles
    inputField: {
      borderBottom: "1pt solid black",
      minHeight: 15,
      marginRight: 10,
      paddingLeft: 2,
      flex: 1,
    },

    fieldNumber: {
      fontSize: "4.5pt",
      letterSpacing: 0,
      textAlign: "right",
      marginRight: "1pt",
    },
    // Small text
    smallText: {
      fontSize: 7,
    },

    // Bold text
    boldText: {
      fontWeight: "bold",
    },
  })

  return (
    <Page size="LETTER" style={styles.page}>
      <View style={styles.headerTable}>
        <View style={[styles.headerRow]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { fontWeight: "bold" }]}>{t(`${prefix}.title`)}</Text>
          </View>
          <View style={[styles.headerRight, { backgroundColor: "#c0c0c0" }]}>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontSize: 6 }}>{t(`${prefix}.CSAF28012`)}</Text>
              <Text style={{ fontSize: 6, marginLeft: "60pt" }}>{t(`${prefix}.Form`)}</Text>
            </View>
            <Text style={{ fontSize: 6, paddingTop: "2pt" }}>{t(`${prefix}.SetVer2410`)}</Text>
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
              {t(`${prefix}.theseDocumentsIssuedForTheUseOf`)}{" "}
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
              {t(`${prefix}.andMayNotBeUsedByAnyOtherPersonsWithoutAuthorization`)}
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
                letterSpacing: 0,
                fontFamily: "Helvetica",
              }}
            >
              {t(`${prefix}.projectNumber`)}
            </Text>
            <View style={{ minHeight: 15, paddingLeft: 2 }}>
              <Text style={{ fontSize: "6pt" }}>{formJson.projectNumber || ""}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: "7pt" }}>
              <Text style={styles.fieldNumber}>2</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.sectionHeader}>{t(`${prefix}.buildingLocation`)}</Text>
      <View style={styles.formSection}>
        <View style={[styles.formRow, { minHeight: 17 }]}>
          <View style={[styles.fieldLabel, { width: 300 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.model`)}:{formJson.buildingLocation?.model || ""}
            </Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 150 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.site`)}:{formJson.buildingLocation?.site || ""}
            </Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 150 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.lot`)}:{formJson.buildingLocation?.lot || ""}
            </Text>
          </View>
        </View>
        <View style={[styles.formRowLast, { minHeight: 17 }]}>
          <View style={[styles.fieldLabel, { width: 300 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.address`)}: {formJson.buildingLocation?.address || ""}
            </Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 150 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.city`)}/{t(`${prefix}.province`)}: {formJson.buildingLocation?.city || ""}
            </Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 150 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.postalCode`)}: {formJson.buildingLocation?.postalCode || ""}
            </Text>
          </View>
        </View>
      </View>

      <Text style={[styles.sectionHeader, { borderTop: "1pt solid black" }]}>
        {t(`${prefix}.calculationResultsRoomByRoom`)}
      </Text>
      <View style={styles.formSection}>
        <View style={[styles.formRow, { minHeight: 15 }]}>
          <View style={[styles.fieldLabel, { width: 20, textAlign: "center" }]}>
            <Text style={{ fontSize: 8, fontWeight: "bold" }}>#</Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 15, width: 1 }}></View>
          <View style={[styles.fieldLabel, { flex: 1, textAlign: "center" }]}>
            <Text style={{ fontSize: 8, fontWeight: "bold" }}>{t(`${prefix}.roomName`)}</Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 15, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 80, textAlign: "center" }]}>
            <Text style={{ fontSize: 7, fontWeight: "bold" }}>{t(`${prefix}.heating`)}</Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 15, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 80, textAlign: "center" }]}>
            <Text style={{ fontSize: 7, fontWeight: "bold" }}>{t(`${prefix}.cooling`)}</Text>
          </View>
        </View>

        {roomData.map((room, index) => (
          <View key={room.number} style={[styles.formRow, { minHeight: 12 }]}>
            <View style={[styles.fieldLabel, { width: 20, textAlign: "center" }]}>
              <Text style={{ fontSize: 6 }}>{room.number}</Text>
            </View>
            <View style={{ borderLeft: "1pt solid black", minHeight: 12, width: 1 }}></View>
            <View style={[styles.fieldLabel, { flex: 1 }]}>
              <Text style={{ fontSize: 6 }}>{formJson.roomByRoom?.[room.number]?.name || ""}</Text>
            </View>
            <View style={{ borderLeft: "1pt solid black", minHeight: 12, width: 1 }}></View>
            <View style={[styles.fieldLabel, { width: 80, textAlign: "center" }]}>
              <Text style={{ fontSize: 6 }}>{formJson.roomByRoom?.[room.number]?.heating || ""}</Text>
            </View>
            <View style={{ borderLeft: "1pt solid black", minHeight: 12, width: 1 }}></View>
            <View style={[styles.fieldLabel, { width: 80, textAlign: "center" }]}>
              <Text style={{ fontSize: 6 }}>{formJson.roomByRoom?.[room.number]?.cooling || ""}</Text>
            </View>
          </View>
        ))}

        <View style={[styles.formRow, { minHeight: 14 }]}>
          <View style={[styles.fieldLabel, { flex: 1, alignItems: "flex-end" }]}>
            <Text style={{ fontSize: 7, fontWeight: "bold", paddingLeft: 5 }}>{t(`${prefix}.ventilationLoss`)} </Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 14, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 80, textAlign: "center" }]}>
            <Text style={{ fontSize: 7, fontWeight: "bold" }}>
              {" "}
              {formJson.roomByRoomSummary?.ventilationLoss || ""} {t(`${prefix}.BtuPerH`)}
            </Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 14, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 80, textAlign: "center" }]}>
            <Text style={{ fontSize: 7, fontWeight: "bold" }}>
              {" "}
              {formJson.roomByRoomSummary?.latentGain || ""} {t(`${prefix}.BtuPerH`)}
            </Text>
          </View>
        </View>

        <View style={[styles.formRow, { minHeight: 14 }]}>
          <View style={[styles.fieldLabel, { flex: 1, alignItems: "flex-end" }]}>
            <Text style={{ fontSize: 7, fontWeight: "bold", paddingRight: 5, textAlign: "right" }}>
              {t(`${prefix}.totalBuildingLoss`)}
            </Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 14, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 80, textAlign: "center" }]}>
            <Text style={{ fontSize: 7, fontWeight: "bold" }}>
              {" "}
              {formJson.roomByRoomSummary?.totalBuildingLoss || ""} {t(`${prefix}.BtuPerH`)}
            </Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 14, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 80, textAlign: "center" }]}>
            <Text style={{ fontSize: 7, fontWeight: "bold" }}>
              {" "}
              {formJson.roomByRoomSummary?.nominalCoolingCapacity || ""} {t(`${prefix}.BtuPerH`)}
            </Text>
          </View>
        </View>
        <View style={[styles.formRow, { minHeight: 14 }]}>
          <View style={[styles.fieldLabel, { flex: 1, alignItems: "flex-end" }]}>
            <Text style={{ fontSize: 7, paddingLeft: 5 }}>
              {t(`${prefix}.seePage1ForHeatingAndCoolingSystemCapacityLimits`)}
            </Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 14, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 80, textAlign: "center" }]}>
            <Text style={{ fontSize: 7 }}>
              {" "}
              {t(`${prefix}.issued`)}{" "}
              {formJson.roomByRoomSummary?.issued
                ? new Date(formJson.roomByRoomSummary.issued).toLocaleDateString()
                : ""}
            </Text>
            <View style={{ width: "370pt", color: "black", position: "relative", top: "17pt" }}>
              <Text style={styles.fieldNumber}>76</Text>
            </View>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 14, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 80, textAlign: "center" }]}>
            <Text style={{ fontSize: 7, fontWeight: "bold" }}>{t(`${prefix}.page3Of`)} 3</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.bottomLeft}>
          <Text style={{ color: "blue", fontSize: 8 }}>
            {t(`${prefix}.areaForSoftwareVendorsInformationLogoContactInfoVersionNumber`)}
          </Text>
          <View style={{ width: "395pt", color: "black", position: "relative", top: "12pt" }}>
            <Text style={styles.fieldNumber}>63</Text>
          </View>
        </View>
        <View style={styles.bottomRight}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
            <Image src={logoPath} style={{ width: 120, height: 40 }} />
          </View>
        </View>
      </View>
    </Page>
  )
}
