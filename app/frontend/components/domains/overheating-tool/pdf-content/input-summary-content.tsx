import { Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer"
import React from "react"
import { useTranslation } from "react-i18next"
import { Checkbox } from "../../../shared/pdf"

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
    flex: 1,
    border: "1pt solid black",
    padding: 8,
    textAlign: "center",
    fontSize: 9,
    fontWeight: "bold",
    color: "blue",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 40,
    width: 585,
    borderTop: "none",
  },
  bottomRight: {
    border: "1pt solid black",
    width: 181.5,
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

interface PDFComponentProps {
  data: any
  assetDirectoryPath: string
}

export const SingleZoneCoolingHeatingInputSummaryContent: React.FC<PDFComponentProps> = ({
  data,
  assetDirectoryPath,
}) => {
  const formJson = data.formJson || data.form_json || {}
  const { t } = useTranslation() as any
  const prefix = "singleZoneCoolingHeatingTool.pdfContent"
  const titleKey = `${prefix}.inputSummary.title`

  const logoPath = `${assetDirectoryPath}/images/f280/hvac-designers-of-canada-logo.png`

  return (
    <Page size="LETTER" style={styles.page}>
      <View style={styles.headerTable}>
        <View style={[styles.headerRow]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { fontWeight: "bold" }]}>{t(titleKey)}</Text>
          </View>
          <View style={[styles.headerRight, { backgroundColor: "#c0c0c0" }]}>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontSize: 6 }}>{t(`${prefix}.inputSummary.CSAF28012`)}</Text>
              <Text style={{ fontSize: 6, marginLeft: "60pt" }}>{t(`${prefix}.inputSummary.Form`)}</Text>
            </View>
            <Text style={{ fontSize: 6, paddingTop: "2pt" }}>{t(`${prefix}.inputSummary.SetVer2410`)}</Text>
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

      <Text style={styles.sectionHeader}>{t(`${prefix}.inputSummary.buildingLocation.title`)}</Text>
      <View style={styles.formSection}>
        <View style={[styles.formRow, { minHeight: 17 }]}>
          <View style={[styles.fieldLabel, { width: 270 }]}>
            <Text style={{ fontSize: 6 }}>
              {t(`${prefix}.inputSummary.buildingLocation.model`)}: {formJson.buildingLocation?.model || ""}
            </Text>
            <View style={{ position: "absolute", right: "0pt", top: "8pt" }}>
              <Text style={styles.fieldNumber}>3</Text>
            </View>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 19, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 150 }]}>
            <Text style={{ fontSize: 6 }}>
              {t(`${prefix}.inputSummary.buildingLocation.site`)}: {formJson.buildingLocation?.site || ""}
            </Text>
            <View style={{ position: "absolute", right: "0pt", top: "8pt" }}>
              <Text style={styles.fieldNumber}>6</Text>
            </View>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 19, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 150 }]}>
            <Text style={{ fontSize: 6 }}>
              {t(`${prefix}.inputSummary.buildingLocation.lot`)}: {formJson.buildingLocation?.lot || ""}
            </Text>
            <View style={{ position: "absolute", right: "0pt", top: "8pt" }}>
              <Text style={styles.fieldNumber}>7</Text>
            </View>
          </View>
        </View>
        <View style={[styles.formRow, { minHeight: 17 }]}>
          <View style={[styles.fieldLabel, { width: 270 }]}>
            <Text style={{ fontSize: 6 }}>
              {t(`${prefix}.inputSummary.buildingLocation.address`)}: {formJson.buildingLocation?.address || ""}
            </Text>
            <View style={{ position: "absolute", right: "0pt", top: "8pt" }}>
              <Text style={styles.fieldNumber}>4</Text>
            </View>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 19, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 150 }]}>
            <Text style={{ fontSize: 6 }}>
              {t(`${prefix}.inputSummary.buildingLocation.city`)}: {formJson.buildingLocation?.city || ""}
            </Text>
            <View style={{ position: "absolute", right: "0pt", top: "8pt" }}>
              <Text style={styles.fieldNumber}>5</Text>
            </View>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 19, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 150 }]}>
            <Text style={{ fontSize: 6 }}>
              {t(`${prefix}.inputSummary.buildingLocation.postalCode`)}: {formJson.buildingLocation?.postalCode || ""}
            </Text>
            <View style={{ position: "absolute", right: "0pt", top: "7pt" }}>
              <Text style={styles.fieldNumber}>8</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <View style={{ flex: 1 }}></View>
          <Text style={{ fontFamily: "Times-Roman", fontSize: 10, fontWeight: "bold" }}>
            {t(`${prefix}.inputSummary.calculationBasedOn.title`)}
          </Text>
          <View style={{ flex: 1, alignItems: "flex-start", marginLeft: "10pt" }}>
            <Text style={{ fontSize: 5, fontWeight: "normal", fontFamily: "Helvetica" }}>
              ({t(`${prefix}.inputSummary.calculationBasedOn.SeeFollowingPageForResults`)})
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.formSection}>
        <View style={[styles.formRow, { minHeight: 17 }]}>
          <View style={[styles.fieldLabel, { width: 120 }]}>
            <Text style={{ fontSize: 6 }}>{t(`${prefix}.inputSummary.calculationBasedOn.dimensionalInfo`)}</Text>
            <Text style={{ fontSize: 6 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.basedOn`)}:{" "}
              {formJson.calculationBasedOn?.dimensionalInfo || ""}
            </Text>
          </View>
          <View style={{ position: "absolute", right: "5pt", top: "10pt" }}>
            <Text style={styles.fieldNumber}>9</Text>
          </View>
        </View>
        <View style={[styles.formRow, { minHeight: 17 }]}>
          <View style={[styles.fieldLabel, { width: 270 }]}>
            <Text style={{ fontSize: 6 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.attachment`)}:{" "}
              {formJson.calculationBasedOn?.attachment || ""}
            </Text>
            <View style={{ position: "absolute", right: "0pt", top: "7pt" }}>
              <Text style={styles.fieldNumber}>10</Text>
            </View>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 150 }]}>
            <Text style={{ fontSize: 6 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.frontFacing`)}:{" "}
              {formJson.calculationBasedOn?.frontFacing || ""}
            </Text>
            <View style={{ position: "absolute", right: "0pt", top: "7pt" }}>
              <Text style={styles.fieldNumber}>16</Text>
            </View>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 150 }]}>
            <Text style={{ fontSize: 6 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.assumed`)}: {formJson.calculationBasedOn?.assumed || ""}
            </Text>
            <View style={{ position: "absolute", right: "0pt", top: "7pt" }}>
              <Text style={styles.fieldNumber}>17</Text>
            </View>
          </View>
        </View>
        <View style={[styles.formRow, { minHeight: 17 }]}>
          <View style={[styles.fieldLabel, { width: 270 }]}>
            <Text style={{ fontSize: 6 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.ofStories`)}: {formJson.calculationBasedOn?.stories || ""}
            </Text>
            <View style={{ position: "absolute", right: "0pt", top: "7pt" }}>
              <Text style={styles.fieldNumber}>11</Text>
            </View>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 150 }]}>
            <Text style={{ fontSize: 6 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.airTightness`)}:{" "}
              {formJson.calculationBasedOn?.airTightness || ""}
            </Text>
            <View style={{ position: "absolute", right: "0pt", top: "7pt" }}>
              <Text style={styles.fieldNumber}>18</Text>
            </View>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 150 }]}>
            <Text style={{ fontSize: 6 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.assumed`)}: {formJson.calculationBasedOn?.assumed || ""}
            </Text>
            <View style={{ position: "absolute", right: "0pt", top: "7pt" }}>
              <Text style={styles.fieldNumber}>19</Text>
            </View>
          </View>
          <View style={[styles.fieldLabel, { flex: 1 }]}></View>
        </View>
        <View style={[styles.formRow, { minHeight: 17 }]}>
          <View style={[styles.fieldLabel, { width: 270 }]}>
            <Text style={{ fontSize: 6 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.weatherLocation`)}:{" "}
              {formJson.calculationBasedOn?.weatherLocation || ""}
            </Text>
            <View style={{ position: "absolute", right: "0pt", top: "7pt" }}>
              <Text style={styles.fieldNumber}>12</Text>
            </View>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 150 }]}>
            <Text style={{ fontSize: 6 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.internal`)}:{" "}
              {formJson.calculationBasedOn?.internal_shading || ""}
            </Text>
            <View style={{ position: "absolute", right: "0pt", top: "7pt" }}>
              <Text style={styles.fieldNumber}>21</Text>
            </View>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 150 }]}>
            <Text style={{ fontSize: 6 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.assumed`)}: {formJson.calculationBasedOn?.assumed || ""}
            </Text>
            <View style={{ position: "absolute", right: "0pt", top: "7pt" }}>
              <Text style={styles.fieldNumber}>21a</Text>
            </View>
          </View>
          <View style={[styles.fieldLabel, { flex: 1 }]}></View>
        </View>
        <View style={[styles.formRow, { minHeight: 17 }]}>
          <View style={[styles.fieldLabel, { width: 270 }]}>
            <Text style={{ fontSize: 6 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.windExposureSite`)}:{" "}
              {formJson.climateData?.windExposure || ""}
            </Text>
            <View style={{ position: "absolute", right: "0pt", top: "7pt" }}>
              <Text style={styles.fieldNumber}>20</Text>
            </View>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 150 }]}>
            <Text style={{ fontSize: 6 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.occupants`)}: {formJson.calculationBasedOn?.occupants || ""}
            </Text>
            <View style={{ position: "absolute", right: "0pt", top: "7pt" }}>
              <Text style={styles.fieldNumber}>22</Text>
            </View>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 150 }]}>
            <Text style={{ fontSize: 6 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.assumed`)}: {formJson.calculationBasedOn?.assumed || ""}
            </Text>
            <View style={{ position: "absolute", right: "0pt", top: "7pt" }}>
              <Text style={styles.fieldNumber}>22a</Text>
            </View>
          </View>
          <View style={[styles.fieldLabel, { flex: 1 }]}></View>
        </View>
        <View style={[styles.formRow, { minHeight: 17 }]}>
          <View style={[styles.fieldLabel, { width: 270 }]}>
            <Text style={{ fontSize: 6 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.windShelteringBuilding`)}:{" "}
              {formJson.climateData?.windShelteringBuilding || ""}
            </Text>
            <View style={{ position: "absolute", right: "0pt", top: "7pt" }}>
              <Text style={styles.fieldNumber}>20a</Text>
            </View>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 150 }]}>
            <Text style={{ fontSize: 6 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.ventilated`)}: {formJson.climateData?.ventilated || ""}
            </Text>
            <View style={{ position: "absolute", right: "0pt", top: "7pt" }}>
              <Text style={styles.fieldNumber}>13</Text>
            </View>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 150 }]}>
            <Text style={{ fontSize: 6 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.hrvErv`)}: {formJson.climateData?.hrvErv || ""}
            </Text>
            <View style={{ position: "absolute", right: "0pt", top: "7pt" }}>
              <Text style={styles.fieldNumber}>14</Text>
            </View>
          </View>
          <View style={[styles.fieldLabel, { flex: 1 }]}></View>
        </View>

        <View style={[styles.formRow, { minHeight: 17 }]}>
          <View
            style={[
              styles.fieldLabel,
              { width: 80, flexDirection: "row", alignItems: "flex-end", justifyContent: "flex-end" },
            ]}
          >
            <Text style={{ fontSize: 7, textAlign: "right", flex: 1, paddingRight: 5 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.Units`)}: {formJson.calculationBasedOn?.Units || ""}
            </Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 80, flexDirection: "row", alignItems: "flex-end" }]}>
            <Checkbox checked={formJson.submissionType === "imperial" || !formJson.submissionType} text="Imperial" />
            <View style={{ position: "absolute", right: "0pt", top: "7pt" }}>
              <Text style={styles.fieldNumber}>bi</Text>
            </View>
          </View>
          <View style={[styles.fieldLabel, { width: 103, flexDirection: "row", alignItems: "center" }]}>
            <Checkbox checked={formJson.submissionType === "metric"} text="Metric" />
            <View style={{ position: "absolute", right: "20pt", top: "7pt" }}>
              <Text style={styles.fieldNumber}>bm</Text>
            </View>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 148 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.ASE`)}: {formJson.climateData?.ase || ""}
            </Text>
            <View style={{ position: "absolute", right: "0pt", top: "7pt" }}>
              <Text style={styles.fieldNumber}>15</Text>
            </View>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 147 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.ATRE`)}: {formJson.climateData?.atre || ""}
            </Text>
            <View style={{ position: "absolute", right: "0pt", top: "7pt" }}>
              <Text style={styles.fieldNumber}>15a</Text>
            </View>
          </View>
          <View style={[styles.fieldLabel, { flex: 1 }]}></View>
        </View>
      </View>
      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 2 }}>
          <Text style={[styles.sectionHeader]}>
            {t(`${prefix}.inputSummary.calculationBasedOn.heatingDesignConditions`)}
          </Text>
          <View style={[styles.formSection]}>
            <View style={[styles.formRow, { minHeight: 17 }]}>
              <View style={[styles.fieldLabel, { width: 150 }]}>
                <Text style={{ fontSize: 6 }}>
                  {t(`${prefix}.inputSummary.calculationBasedOn.outdoorTemp`)}:{" "}
                  {formJson.heatingDesignConditions?.outdoorTemp || ""}
                </Text>
                <View style={{ position: "absolute", right: "0pt", top: "7pt" }}>
                  <Text style={styles.fieldNumber}>24</Text>
                </View>
              </View>
              <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
              <View style={[styles.fieldLabel, { width: 150 }]}>
                <Text style={{ fontSize: 6 }}>
                  {t(`${prefix}.inputSummary.calculationBasedOn.indoorTemp`)}:{" "}
                  {formJson.heatingDesignConditions?.indoorTemp || ""}
                </Text>
                <View style={{ position: "absolute", right: "0pt", top: "7pt" }}>
                  <Text style={styles.fieldNumber}>25</Text>
                </View>
              </View>
              <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
              <View style={[styles.fieldLabel, { width: 150 }]}>
                <Text style={{ fontSize: 6 }}>
                  {t(`${prefix}.inputSummary.calculationBasedOn.meanSoilTemp`)}:{" "}
                  {formJson.heatingDesignConditions?.meanSoilTemp || ""}
                </Text>
                <View style={{ position: "absolute", right: "0pt", top: "7pt" }}>
                  <Text style={styles.fieldNumber}>26</Text>
                </View>
              </View>
            </View>
            <View style={[styles.formRow, { minHeight: 17 }]}>
              <View style={[styles.fieldLabel, { width: 150 }]}>
                <Text style={{ fontSize: 6 }}>
                  {t(`${prefix}.inputSummary.calculationBasedOn.soilConductivity`)}:{" "}
                  {formJson.heatingDesignConditions?.soilConductivity || ""}
                </Text>
                <View style={{ position: "absolute", right: "0pt", top: "7pt" }}>
                  <Text style={styles.fieldNumber}>26a</Text>
                </View>
              </View>
              <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
              <View style={[styles.fieldLabel, { width: 150 }]}>
                <Text style={{ fontSize: 6 }}>
                  {t(`${prefix}.inputSummary.calculationBasedOn.waterTableDepth`)}:{" "}
                  {formJson.heatingDesignConditions?.waterTableDepth || ""}
                </Text>
                <View style={{ position: "absolute", right: "0pt", top: "7pt" }}>
                  <Text style={styles.fieldNumber}>26b</Text>
                </View>
              </View>
              <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
              <View style={[styles.fieldLabel, { width: 150 }]}>
                <Text style={{ fontSize: 6 }}>
                  {t(`${prefix}.inputSummary.calculationBasedOn.slabFluidTemp`)}:{" "}
                  {formJson.heatingDesignConditions?.slabFluidTemp || ""}
                </Text>
                <View style={{ position: "absolute", right: "0pt", top: "7pt" }}>
                  <Text style={styles.fieldNumber}>26c</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionHeader, { borderLeft: "none" }]}>
            {t(`${prefix}.inputSummary.calculationBasedOn.coolingDesignConditions`)}
          </Text>
          <View style={[styles.formSection, { borderLeft: "none" }]}>
            <View style={[styles.formRow, { minHeight: 17 }]}>
              <View style={[styles.fieldLabel, { width: 200 }]}>
                <Text style={{ fontSize: 6 }}>
                  {t(`${prefix}.inputSummary.calculationBasedOn.outdoorTemp`)}:{" "}
                  {formJson.coolingDesignConditions?.outdoorTemp || ""}
                </Text>
                <View style={{ position: "absolute", right: "0pt", top: "7pt" }}>
                  <Text style={styles.fieldNumber}>27</Text>
                </View>
              </View>
              <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
              <View style={[styles.fieldLabel, { width: 200 }]}>
                <Text style={{ fontSize: 6 }}>
                  {t(`${prefix}.inputSummary.calculationBasedOn.range`)}:{" "}
                  {formJson.coolingDesignConditions?.range || ""}
                </Text>
                <View style={{ position: "absolute", right: "0pt", top: "7pt" }}>
                  <Text style={styles.fieldNumber}>29</Text>
                </View>
              </View>
            </View>
            <View style={[styles.formRow, { minHeight: 17 }]}>
              <View style={[styles.fieldLabel, { width: 200 }]}>
                <Text style={{ fontSize: 6 }}>
                  {t(`${prefix}.inputSummary.calculationBasedOn.indoorTemp`)}:{" "}
                  {formJson.coolingDesignConditions?.indoorTemp || ""}
                </Text>
                <View style={{ position: "absolute", right: "0pt", top: "7pt" }}>
                  <Text style={styles.fieldNumber}>28</Text>
                </View>
              </View>
              <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
              <View style={[styles.fieldLabel, { width: 200 }]}>
                <Text style={{ fontSize: 6 }}>
                  {t(`${prefix}.inputSummary.calculationBasedOn.latitude`)}:{" "}
                  {formJson.coolingDesignConditions?.latitude || ""}
                </Text>
                <View style={{ position: "absolute", right: "0pt", top: "7pt" }}>
                  <Text style={styles.fieldNumber}>30</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionHeader]}>{t(`${prefix}.inputSummary.calculationBasedOn.aboveGradeWalls`)}</Text>
          <View style={[styles.formSection]}>
            {[
              [t(`${prefix}.inputSummary.aboveGradeWalls.styleA`), "style_a", 31],
              [t(`${prefix}.inputSummary.aboveGradeWalls.styleB`), "style_b", 32],
              [t(`${prefix}.inputSummary.aboveGradeWalls.styleC`), "style_c", 33],
            ].map(([label, styleKey, fieldNumber], index) => (
              <View key={label} style={index === 2 ? styles.formRowLast : styles.formRow}>
                <View style={[styles.fieldLabel, { minHeight: 20 }]}>
                  <Text style={{ fontSize: 6 }}>
                    {label}: {formJson[`aboveGradeWallsStyle${styleKey.slice(-1).toUpperCase()}`] || "[EMPTY]"}
                  </Text>
                </View>
                <View style={{ position: "absolute", right: "5pt", top: "13pt" }}>
                  <Text style={styles.fieldNumber}>{fieldNumber}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionHeader, { borderLeft: "none" }]}>
            {t(`${prefix}.inputSummary.calculationBasedOn.belowGradeWalls`)}
          </Text>
          <View style={[styles.formSection, { borderLeft: "none" }]}>
            {[
              [t(`${prefix}.inputSummary.belowGradeWalls.styleA`), "style_a", 34],
              [t(`${prefix}.inputSummary.belowGradeWalls.styleB`), "style_b", 35],
              [t(`${prefix}.inputSummary.belowGradeWalls.styleC`), "style_c", 36],
            ].map(([label, styleKey, fieldNumber], index) => (
              <View key={label} style={index === 2 ? styles.formRowLast : styles.formRow}>
                <View style={[styles.fieldLabel, { minHeight: 20 }]}>
                  <Text style={{ fontSize: 6 }}>
                    {label}: {formJson[`belowGradeWallsStyle${styleKey.slice(-1).toUpperCase()}`] || "[EMPTY]"}
                  </Text>
                </View>
                <View style={{ position: "absolute", right: "5pt", top: "13pt" }}>
                  <Text style={styles.fieldNumber}>{fieldNumber}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionHeader, { borderTop: "1pt solid black" }]}>
            {t(`${prefix}.inputSummary.ceilings.title`)}
          </Text>
          <View style={[styles.formSection]}>
            {[
              [t(`${prefix}.inputSummary.ceilings.styleA`), "style_a", 40],
              [t(`${prefix}.inputSummary.ceilings.styleB`), "style_b", 41],
              [t(`${prefix}.inputSummary.ceilings.styleC`), "style_c", 42],
            ].map(([label, styleKey, fieldNumber], index) => (
              <View key={label} style={index === 2 ? styles.formRowLast : styles.formRow}>
                <View style={[styles.fieldLabel, { minHeight: 20 }]}>
                  <Text style={{ fontSize: 6 }}>
                    {label}: {formJson[`ceilingsStyle${styleKey.slice(-1).toUpperCase()}`] || "[EMPTY]"}
                  </Text>
                </View>
                <View style={{ position: "absolute", right: "5pt", top: "13pt" }}>
                  <Text style={styles.fieldNumber}>{fieldNumber}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionHeader, { borderLeft: "none", borderTop: "1pt solid black" }]}>
            {t(`${prefix}.inputSummary.calculationBasedOn.floorsOnSoil`)}
          </Text>
          <View style={[styles.formSection, { borderLeft: "none" }]}>
            {[
              [t(`${prefix}.inputSummary.floorsOnSoil.styleA`), "style_a", 37],
              [t(`${prefix}.inputSummary.floorsOnSoil.styleB`), "style_b", 38],
              [t(`${prefix}.inputSummary.floorsOnSoil.styleC`), "style_c", 39],
            ].map(([label, styleKey, fieldNumber], index) => (
              <View key={label} style={index === 2 ? styles.formRowLast : styles.formRow}>
                <View style={[styles.fieldLabel, { minHeight: 20 }]}>
                  <Text style={{ fontSize: 6 }}>
                    {label}: {formJson[`floorsonSoilStyle${styleKey.slice(-1).toUpperCase()}`] || "[EMPTY]"}
                  </Text>
                </View>
                <View style={{ position: "absolute", right: "5pt", top: "13pt" }}>
                  <Text style={styles.fieldNumber}>{fieldNumber}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionHeader, { borderTop: "1pt solid black" }]}>
            {t(`${prefix}.inputSummary.calculationBasedOn.windows`)}
          </Text>
          <View style={[styles.formSection]}>
            {[
              [t(`${prefix}.inputSummary.windows.styleA`), "style_a", 49],
              [t(`${prefix}.inputSummary.windows.styleB`), "style_b", 50],
              [t(`${prefix}.inputSummary.windows.styleC`), "style_c", 51],
            ].map(([label, styleKey, fieldNumber], index) => (
              <View key={label} style={index === 2 ? styles.formRowLast : styles.formRow}>
                <View style={[styles.fieldLabel, { minHeight: 20 }]}>
                  <Text style={{ fontSize: 6 }}>
                    {label}: {formJson[`windowsStyle${styleKey.slice(-1).toUpperCase()}`] || "[EMPTY]"}
                  </Text>
                </View>
                <View style={{ position: "absolute", right: "5pt", top: "13pt" }}>
                  <Text style={styles.fieldNumber}>{fieldNumber}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionHeader, { borderLeft: "none", borderTop: "1pt solid black" }]}>
            {t(`${prefix}.inputSummary.calculationBasedOn.exposedFloors`)}
          </Text>
          <View style={[styles.formSection, { borderLeft: "none" }]}>
            {[
              [t(`${prefix}.inputSummary.exposedFloors.styleA`), "style_a", 43],
              [t(`${prefix}.inputSummary.exposedFloors.styleB`), "style_b", 44],
              [t(`${prefix}.inputSummary.exposedFloors.styleC`), "style_c", 45],
            ].map(([label, styleKey, fieldNumber], index) => (
              <View key={label} style={index === 2 ? styles.formRowLast : styles.formRow}>
                <View style={[styles.fieldLabel, { minHeight: 20 }]}>
                  <Text style={{ fontSize: 6 }}>
                    {label}: {formJson[`exposedFloorsStyle${styleKey.slice(-1).toUpperCase()}`] || "[EMPTY]"}
                  </Text>
                </View>
                <View style={{ position: "absolute", right: "5pt", top: "13pt" }}>
                  <Text style={styles.fieldNumber}>{fieldNumber}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionHeader, { borderTop: "1pt solid black" }]}>
            {t(`${prefix}.inputSummary.calculationBasedOn.skylights`)}
          </Text>
          <View style={[styles.formSection]}>
            {[
              [t(`${prefix}.inputSummary.skylights.styleA`), "style_a", 52],
              [t(`${prefix}.inputSummary.skylights.styleB`), "style_b", 53],
              [t(`${prefix}.inputSummary.skylights.styleC`), "style_c", 54],
            ].map(([label, styleKey, fieldNumber], index) => (
              <View key={label} style={index === 2 ? styles.formRowLast : styles.formRow}>
                <View style={[styles.fieldLabel, { minHeight: 20 }]}>
                  <Text style={{ fontSize: 6 }}>
                    {label}: {formJson[`skylightsStyle${styleKey.slice(-1).toUpperCase()}`] || "[EMPTY]"}
                  </Text>
                </View>
                <View style={{ position: "absolute", right: "5pt", top: "13pt" }}>
                  <Text style={styles.fieldNumber}>{fieldNumber}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionHeader, { borderLeft: "none", borderTop: "1pt solid black" }]}>
            {t(`${prefix}.inputSummary.calculationBasedOn.doors`)}
          </Text>
          <View style={[styles.formSection, { borderLeft: "none" }]}>
            {[
              [t(`${prefix}.inputSummary.doors.styleA`), "style_a", 46],
              [t(`${prefix}.inputSummary.doors.styleB`), "style_b", 47],
              [t(`${prefix}.inputSummary.doors.styleC`), "style_c", 48],
            ].map(([label, styleKey, fieldNumber], index) => (
              <View key={label} style={index === 2 ? styles.formRowLast : styles.formRow}>
                <View style={[styles.fieldLabel, { minHeight: 20 }]}>
                  <Text style={{ fontSize: 6 }}>
                    {label}: {formJson[`doorsStyle${styleKey.slice(-1).toUpperCase()}`] || "[EMPTY]"}
                  </Text>
                </View>
                <View style={{ position: "absolute", right: "5pt", top: "13pt" }}>
                  <Text style={styles.fieldNumber}>{fieldNumber}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", border: "1pt solid black" }}>
        <View style={{ width: "279pt" }}></View>
        <View style={{ borderLeft: "1pt solid black", borderRight: "1pt solid black", padding: 5, width: "100pt" }}>
          <Text style={{ fontSize: 8, textAlign: "center" }}>
            {t(`${prefix}.inputSummary.calculationBasedOn.issued`)} {formJson.calculationBasedOn?.issued || ""}
          </Text>
        </View>
        <View style={{ flex: 1, flexDirection: "row" }}>
          <Text style={{ fontSize: 7, fontWeight: "bold", paddingLeft: 10 }}>
            {t(`${prefix}.inputSummary.calculationBasedOn.page2Of`)}
          </Text>
        </View>
      </View>
      <View style={styles.bottomSection}>
        <View style={styles.bottomLeft}>
          <Text>
            {t(
              `singleZoneCoolingHeatingTool.pdfContent.areaForSoftwareVendorsInformationLogoContactInfoVersionNumber`
            )}{" "}
          </Text>
          <View style={{ width: "370pt", color: "black", position: "relative", top: "17pt" }}>
            <Text style={styles.fieldNumber}>63</Text>
          </View>
        </View>
        <View style={styles.bottomRight}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
            <Image src={logoPath} />
          </View>
        </View>
      </View>
    </Page>
  )
}
