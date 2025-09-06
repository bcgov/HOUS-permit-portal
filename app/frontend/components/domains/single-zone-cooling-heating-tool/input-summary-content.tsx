import { Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer"
import React from "react"
import { useTranslation } from "react-i18next"
import { getStyleValue } from "../../../utils/object-utils"

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
    minHeight: 30,
  },
  headerLeft: {
    flex: 4,
    backgroundColor: "#d3d3d3",
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
    fontSize: 14,
    fontFamily: "Times-Roman",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 7,
    textAlign: "center",
    lineHeight: 1.2,
  },

  // Section headers
  sectionHeader: {
    backgroundColor: "#d3d3d3",
    border: "1pt solid black",
    borderTop: "none",
    fontFamily: "Times-Roman",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
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
    paddingLeft: 2,
    paddingTop: 1,
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
    //width: 585,
    borderTop: "none",
  },
  bottomRight: {
    border: "1pt solid black",
    //width: 181.5,
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

const Checkbox: React.FC<{ checked?: boolean; text: string }> = ({ checked = false, text }) => (
  <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 20 }}>
    <View style={checked ? styles.checkboxChecked : styles.checkbox}>
      {checked && <Text style={{ color: "white" }}>X</Text>}
    </View>
    <Text style={{ fontSize: 6 }}>{text}</Text>
  </View>
)

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
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { fontWeight: "bold" }]}>{t(titleKey)}</Text>
          </View>
          <View style={[styles.headerRight, { backgroundColor: "#c0c0c0" }]}>
            <Text>{t(`${prefix}.inputSummary.CSAF28012`)}</Text>
            <Text>{t(`${prefix}.inputSummary.SetVer2410`)}</Text>
            <Text style={{ fontWeight: "bold", fontSize: 6 }}>{t(`${prefix}.inputSummary.Form`)}</Text>
          </View>
        </View>
        <View style={styles.headerRow}>
          <View style={styles.headerLeftNoBg}>
            <Text style={{ fontSize: 6, paddingLeft: 5 }}>
              {t(`${prefix}.inputSummary.theseDocumentsIssuedForTheUseOf`)}{" "}
              <Text style={{ textDecoration: "underline" }}>{formJson.drawingIssueFor || ""}</Text>
            </Text>
            <Text style={{ fontSize: 6, paddingLeft: 5 }}>
              {t(`${prefix}.inputSummary.andMayNotBeUsedByAnyOtherPersonsWithoutAuthorization`)}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={{ fontWeight: "bold", fontSize: 6 }}>{t(`${prefix}.inputSummary.projectNumber`)}</Text>
            <View style={{ minHeight: 15, paddingLeft: 2 }}>
              <Text style={{ fontSize: 6 }}>{formJson.projectNumber || ""}</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.sectionHeader}>{t(`${prefix}.inputSummary.buildingLocation.title`)}</Text>
      <View style={styles.formSection}>
        <View style={[styles.formRow, { minHeight: 17 }]}>
          <View style={[styles.fieldLabel, { width: 300 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.inputSummary.buildingLocation.model`)}: {formJson.buildingLocation?.model || ""}
            </Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { flex: 1 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.inputSummary.buildingLocation.site`)}: {formJson.buildingLocation?.site || ""}
            </Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 100 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.inputSummary.buildingLocation.lot`)}: {formJson.buildingLocation?.lot || ""}
            </Text>
          </View>
        </View>
        <View style={[styles.formRow, { minHeight: 17 }]}>
          <View style={[styles.fieldLabel, { width: 300 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.inputSummary.buildingLocation.address`)}: {formJson.buildingLocation?.address || ""}
            </Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { flex: 1 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.inputSummary.buildingLocation.city`)}: {formJson.buildingLocation?.city || ""}
            </Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 100 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.inputSummary.buildingLocation.postalCode`)}: {formJson.buildingLocation?.postalCode || ""}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <View style={{ flex: 1 }}></View>
          <Text style={{ fontFamily: "Times-Roman", fontSize: 10, fontWeight: "bold" }}>
            {t(`${prefix}.inputSummary.calculationBasedOn.title`)}
          </Text>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={{ fontSize: 7, fontWeight: "normal", fontFamily: "Helvetica" }}>
              ({t(`${prefix}.inputSummary.calculationBasedOn.SeeFollowingPageForResults`)})
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.formSection}>
        <View style={[styles.formRow, { minHeight: 17 }]}>
          <View style={[styles.fieldLabel, { width: 120 }]}>
            <Text style={{ fontSize: 7 }}>{t(`${prefix}.inputSummary.calculationBasedOn.dimensionalInfo`)}</Text>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.basedOn`)}:{" "}
              {formJson.calculationBasedOn?.dimensionalInfo || ""}
            </Text>
          </View>
        </View>
        <View style={[styles.formRow, { minHeight: 17 }]}>
          <View style={[styles.fieldLabel, { width: 300 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.attachment`)}:{" "}
              {formJson.calculationBasedOn?.attachment || ""}
            </Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 150 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.frontFacing`)}:{" "}
              {formJson.calculationBasedOn?.frontFacing || ""}
            </Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 80 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.assumed`)}: {formJson.calculationBasedOn?.assumed || ""}
            </Text>
          </View>
          <View style={[styles.fieldLabel, { flex: 1, borderLeft: "1pt solid black" }]}></View>
        </View>
        <View style={[styles.formRow, { minHeight: 17 }]}>
          <View style={[styles.fieldLabel, { width: 300 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.ofStories`)}: {formJson.calculationBasedOn?.stories || ""}
            </Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 150 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.airTightness`)}:{" "}
              {formJson.calculationBasedOn?.airTightness || ""}
            </Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 80 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.assumed`)}: {formJson.calculationBasedOn?.assumed || ""}
            </Text>
          </View>
          <View style={[styles.fieldLabel, { flex: 1 }]}></View>
        </View>
        <View style={[styles.formRow, { minHeight: 17 }]}>
          <View style={[styles.fieldLabel, { width: 300 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.weatherLocation`)}:{" "}
              {formJson.calculationBasedOn?.weatherLocation || ""}
            </Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 150 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.internal`)}: {formJson.calculationBasedOn?.internal || ""}
            </Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 80 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.assumed`)}: {formJson.calculationBasedOn?.assumed || ""}
            </Text>
          </View>
          <View style={[styles.fieldLabel, { flex: 1 }]}></View>
        </View>
        <View style={[styles.formRow, { minHeight: 17 }]}>
          <View style={[styles.fieldLabel, { width: 300 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.windExposureSite`)}:{" "}
              {formJson.climateData?.windExposure || ""}
            </Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 150 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.occupants`)}: {formJson.calculationBasedOn?.occupants || ""}
            </Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 80 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.assumed`)}: {formJson.calculationBasedOn?.assumed || ""}
            </Text>
          </View>
          <View style={[styles.fieldLabel, { flex: 1 }]}></View>
        </View>
        <View style={[styles.formRow, { minHeight: 17 }]}>
          <View style={[styles.fieldLabel, { width: 300 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.windShelteringBuilding`)}:{" "}
              {formJson.climateData?.climateData?.windShelteringBuilding || ""}
            </Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 150 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.ventilated`)}: {formJson.climateData?.ventilated || ""}
            </Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 80 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.hrvErv`)}: {formJson.climateData?.hrvErv || ""}
            </Text>
          </View>
          <View style={[styles.fieldLabel, { flex: 1 }]}></View>
        </View>

        <View style={[styles.formRow, { minHeight: 17 }]}>
          <View style={[styles.fieldLabel, { width: 300, flexDirection: "row", alignItems: "center" }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.Units`)}: {formJson.calculationBasedOn?.Units || ""}
            </Text>
            <Checkbox checked={formJson.submissionType === "imperial" || !formJson.submissionType} text="Imperial" />
            <Checkbox checked={formJson.submissionType === "metric"} text="Metric" />
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 150 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.ASE`)}: {formJson.climateData?.ASE || ""}
            </Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 80 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.inputSummary.calculationBasedOn.ATRE`)}: {formJson.climateData?.ATRE || ""}
            </Text>
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
                <Text style={{ fontSize: 7 }}>
                  {t(`${prefix}.inputSummary.calculationBasedOn.outdoorTemp`)}:{" "}
                  {formJson.heatingDesignConditions?.outdoorTemp || ""}
                </Text>
              </View>
              <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
              <View style={[styles.fieldLabel, { width: 150 }]}>
                <Text style={{ fontSize: 7 }}>
                  {t(`${prefix}.inputSummary.calculationBasedOn.indoorTemp`)}:{" "}
                  {formJson.heatingDesignConditions?.indoorTemp || ""}
                </Text>
              </View>
              <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
              <View style={[styles.fieldLabel, { width: 150 }]}>
                <Text style={{ fontSize: 7 }}>
                  {t(`${prefix}.inputSummary.calculationBasedOn.meanSoilTemp`)}:{" "}
                  {formJson.heatingDesignConditions?.meanSoilTemp || ""}
                </Text>
              </View>
            </View>
            <View style={[styles.formRow, { minHeight: 17 }]}>
              <View style={[styles.fieldLabel, { width: 150 }]}>
                <Text style={{ fontSize: 7 }}>
                  {t(`${prefix}.inputSummary.calculationBasedOn.soilConductivity`)}:{" "}
                  {formJson.heatingDesignConditions?.soilConductivity || ""}
                </Text>
              </View>
              <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
              <View style={[styles.fieldLabel, { width: 150 }]}>
                <Text style={{ fontSize: 7 }}>
                  {t(`${prefix}.inputSummary.calculationBasedOn.waterTableDepth`)}:{" "}
                  {formJson.heatingDesignConditions?.waterTableDepth || ""}
                </Text>
              </View>
              <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
              <View style={[styles.fieldLabel, { width: 150 }]}>
                <Text style={{ fontSize: 7 }}>
                  {t(`${prefix}.inputSummary.calculationBasedOn.slabFluidTemp`)}:{" "}
                  {formJson.heatingDesignConditions?.slabFluidTemp || ""}
                </Text>
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
                <Text style={{ fontSize: 7 }}>
                  {t(`${prefix}.inputSummary.calculationBasedOn.outdoorTemp`)}:{" "}
                  {formJson.coolingDesignConditions?.outdoorTemp || ""}
                </Text>
              </View>
              <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
              <View style={[styles.fieldLabel, { width: 200 }]}>
                <Text style={{ fontSize: 7 }}>
                  {t(`${prefix}.inputSummary.calculationBasedOn.range`)}:{" "}
                  {formJson.coolingDesignConditions?.range || ""}
                </Text>
              </View>
            </View>
            <View style={[styles.formRow, { minHeight: 17 }]}>
              <View style={[styles.fieldLabel, { width: 200 }]}>
                <Text style={{ fontSize: 7 }}>
                  {t(`${prefix}.inputSummary.calculationBasedOn.indoorTemp`)}:{" "}
                  {formJson.coolingDesignConditions?.indoorTemp || ""}
                </Text>
              </View>
              <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
              <View style={[styles.fieldLabel, { width: 200 }]}>
                <Text style={{ fontSize: 7 }}>
                  {t(`${prefix}.inputSummary.calculationBasedOn.latitude`)}:{" "}
                  {formJson.coolingDesignConditions?.latitude || ""}
                </Text>
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
              [t(`${prefix}.inputSummary.aboveGradeWalls.styleA`), "style_a"],
              [t(`${prefix}.inputSummary.aboveGradeWalls.styleB`), "style_b"],
              [t(`${prefix}.inputSummary.aboveGradeWalls.styleC`), "style_c"],
            ].map(([label, styleKey], index) => (
              <View key={label} style={index === 2 ? styles.formRowLast : styles.formRow}>
                <View style={[styles.fieldLabel, { paddingLeft: 5, minHeight: 20 }]}>
                  <Text style={{ fontSize: 8 }}>
                    {label}: {getStyleValue(formJson, "aboveGradeWalls", styleKey)}
                  </Text>
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
              [t(`${prefix}.inputSummary.belowGradeWalls.styleA`), "style_a"],
              [t(`${prefix}.inputSummary.belowGradeWalls.styleB`), "style_b"],
              [t(`${prefix}.inputSummary.belowGradeWalls.styleC`), "style_c"],
            ].map(([label, styleKey], index) => (
              <View key={label} style={index === 2 ? styles.formRowLast : styles.formRow}>
                <View style={[styles.fieldLabel, { paddingLeft: 5, minHeight: 20 }]}>
                  <Text style={{ fontSize: 8 }}>
                    {label}: {getStyleValue(formJson, "belowGradeWalls", styleKey)}
                  </Text>
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
              [t(`${prefix}.inputSummary.ceilings.styleA`), "style_a"],
              [t(`${prefix}.inputSummary.ceilings.styleB`), "style_b"],
              [t(`${prefix}.inputSummary.ceilings.styleC`), "style_c"],
            ].map(([label, styleKey], index) => (
              <View key={label} style={index === 2 ? styles.formRowLast : styles.formRow}>
                <View style={[styles.fieldLabel, { paddingLeft: 5, minHeight: 20 }]}>
                  <Text style={{ fontSize: 8 }}>
                    {label}: {getStyleValue(formJson, "ceilings", styleKey)}
                  </Text>
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
              [t(`${prefix}.inputSummary.floorsOnSoil.styleA`), "style_a"],
              [t(`${prefix}.inputSummary.floorsOnSoil.styleB`), "style_b"],
              [t(`${prefix}.inputSummary.floorsOnSoil.styleC`), "style_c"],
            ].map(([label, styleKey], index) => (
              <View key={label} style={index === 2 ? styles.formRowLast : styles.formRow}>
                <View style={[styles.fieldLabel, { paddingLeft: 5, minHeight: 20 }]}>
                  <Text style={{ fontSize: 8 }}>
                    {label}: {getStyleValue(formJson, "floorsOnSoil", styleKey)}
                  </Text>
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
              [t(`${prefix}.inputSummary.windows.styleA`), "style_a"],
              [t(`${prefix}.inputSummary.windows.styleB`), "style_b"],
              [t(`${prefix}.inputSummary.windows.styleC`), "style_c"],
            ].map(([label, styleKey], index) => (
              <View key={label} style={index === 2 ? styles.formRowLast : styles.formRow}>
                <View style={[styles.fieldLabel, { paddingLeft: 5, minHeight: 20 }]}>
                  <Text style={{ fontSize: 8 }}>
                    {label}: {getStyleValue(formJson, "windows", styleKey)}
                  </Text>
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
              [t(`${prefix}.inputSummary.exposedFloors.styleA`), "style_a"],
              [t(`${prefix}.inputSummary.exposedFloors.styleB`), "style_b"],
              [t(`${prefix}.inputSummary.exposedFloors.styleC`), "style_c"],
            ].map(([label, styleKey], index) => (
              <View key={label} style={index === 2 ? styles.formRowLast : styles.formRow}>
                <View style={[styles.fieldLabel, { paddingLeft: 5, minHeight: 20 }]}>
                  <Text style={{ fontSize: 8 }}>
                    {label}: {getStyleValue(formJson, "exposedFloors", styleKey)}
                  </Text>
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
              [t(`${prefix}.inputSummary.skylights.styleA`), "style_a"],
              [t(`${prefix}.inputSummary.skylights.styleB`), "style_b"],
              [t(`${prefix}.inputSummary.skylights.styleC`), "style_c"],
            ].map(([label, styleKey], index) => (
              <View key={label} style={index === 2 ? styles.formRowLast : styles.formRow}>
                <View style={[styles.fieldLabel, { paddingLeft: 5, minHeight: 20 }]}>
                  <Text style={{ fontSize: 8 }}>
                    {label}: {getStyleValue(formJson, "skylights", styleKey)}
                  </Text>
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
              [t(`${prefix}.inputSummary.doors.styleA`), "style_a"],
              [t(`${prefix}.inputSummary.doors.styleB`), "style_b"],
              [t(`${prefix}.inputSummary.doors.styleC`), "style_c"],
            ].map(([label, styleKey], index) => (
              <View key={label} style={index === 2 ? styles.formRowLast : styles.formRow}>
                <View style={[styles.fieldLabel, { paddingLeft: 5, minHeight: 20 }]}>
                  <Text style={{ fontSize: 8 }}>
                    {label}: {getStyleValue(formJson, "doors", styleKey)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", border: "1pt solid black" }}>
        <View style={{ flex: 1, width: 750 }}></View>
        <View style={{ borderLeft: "1pt solid black", borderRight: "1pt solid black", padding: 5, minWidth: 120 }}>
          <Text style={{ fontSize: 8, textAlign: "center" }}>
            {t(`${prefix}.inputSummary.calculationBasedOn.issued`)}: {formJson.calculationBasedOn?.issued || ""}
          </Text>
        </View>
        <View style={{ flex: 1, flexDirection: "row" }}>
          <Text style={{ fontSize: 10, fontWeight: "bold", paddingLeft: 10 }}>
            {t(`${prefix}.inputSummary.calculationBasedOn.page2Of`)}
          </Text>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.bottomLeft}>
          <Text>{t(`${prefix}.areaForSoftwareVendorsInformationLogoContactInfoVersionNumber`)}</Text>
        </View>
        <View style={styles.bottomRight}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
            <Image src={logoPath} />
          </View>
        </View>
      </View>

      <View
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontSize: 8 }}>{t(`${prefix}.F280FormsSet2410xlsxSummary`)}</Text>
        <Text style={{ fontSize: 8 }}>{new Date().toLocaleDateString()}</Text>
      </View>
    </Page>
  )
}
