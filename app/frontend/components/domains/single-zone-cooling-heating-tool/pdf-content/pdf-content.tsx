import { Document, Image, Page, Text, View } from "@react-pdf/renderer"
import React from "react"
import { useTranslation } from "react-i18next"
import { pdfStyles as styles } from "../shared-pdf-styles"
import { SingleZoneCoolingHeatingInputSummaryContent } from "./input-summary-content"
import { SingleZoneCoolingHeatingRoomByRoomContent } from "./room-by-room-content"

interface PDFComponentProps {
  data: any
  assetDirectoryPath: string
}

// [OVERHEATING REVIEW] Mini-lesson: keep PDF rendering components small and reusable.
// This file is doing layout primitives + domain rendering in one place. Consider extracting shared PDF atoms
// (Checkbox, LabeledCheckboxBox, header layout) into `app/frontend/components/shared/pdf/` so other forms can reuse them.
//
// Also note: we already introduced `BasePDFForm` — consider using it here (or delete it) to avoid dead abstractions.
const Checkbox: React.FC<{ checked?: boolean; text: string }> = ({ checked = false, text }) => (
  <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 20 }}>
    <View style={checked ? styles.checkboxChecked : styles.checkbox}>
      {checked && <Text style={{ color: "white" }}>X</Text>}
    </View>
    <Text style={{ fontSize: 6 }}>{text}</Text>
  </View>
)

const LabeledCheckboxBox: React.FC<{
  checked?: boolean
  text: string
  corner: string
  width?: number
  height?: number
}> = ({ checked = false, text, corner, width = 200, height = 20 }) => (
  <View
    style={{
      width,
      height,
      position: "relative",
      justifyContent: "center",
      paddingLeft: 4,
      marginLeft: 6,
    }}
  >
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View style={checked ? styles.checkboxChecked : styles.checkbox}>
        {checked && <Text style={{ color: "white" }}>X</Text>}
      </View>
      <Text style={{ fontSize: 6 }}>{text}</Text>
    </View>
    <Text style={{ position: "absolute", right: 2, bottom: 1, fontSize: "4pt" }}>{corner}</Text>
  </View>
)

export const SingleZoneCoolingHeatingPDFContent: React.FC<PDFComponentProps> = ({ data, assetDirectoryPath }) => {
  const formJson = data.formJson || {}

  const { t } = useTranslation() as any
  const prefix = "singleZoneCoolingHeatingTool"

  const logoPath = `${assetDirectoryPath}/images/f280/hvac-designers-of-canada-logo.png`

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.pageInner}>
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
                  <Text style={{ textDecoration: "underline", paddingTop: "10pt" }}>
                    {formJson.drawingIssueFor || ""}
                  </Text>
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
          <Text style={[styles.sectionHeader, { paddingLeft: "226pt" }]}>
            {t(`${prefix}.pdfContent.buildingLocation`)}
          </Text>
          <View style={[styles.formSection]}>
            <View style={[styles.formRow]}>
              <View style={[styles.fieldLabel, { width: "267pt" }]}>
                <Text style={{ fontSize: 6, textAlign: "left" }}>
                  {t(`${prefix}.pdfContent.model`)}: {formJson.buildingLocation?.model || ""}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    marginTop: "4pt",
                    marginBottom: "0pt",
                    paddingBottom: "0pt",
                  }}
                >
                  <Text style={styles.fieldNumber}>3</Text>
                </View>
              </View>
              <View style={{ borderLeft: "1pt solid black", width: 1 }}></View>
              <View style={[styles.fieldLabel, { width: "285pt" }]}>
                <Text style={{ fontSize: 6 }}>
                  {t(`${prefix}.pdfContent.site`)}: {formJson.buildingLocation?.site || ""}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    marginTop: "4pt",
                    marginBottom: "0pt",
                    paddingBottom: "0pt",
                  }}
                >
                  <Text style={styles.fieldNumber}>6</Text>
                </View>
              </View>
            </View>

            <View style={[styles.formRow]}>
              <View style={[styles.fieldLabel, { width: "267pt" }]}>
                <Text style={{ fontSize: 6, textAlign: "left" }}>
                  {t(`${prefix}.pdfContent.address`)}: {formJson.buildingLocation?.address || ""}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    marginTop: "4pt",
                    marginBottom: "0pt",
                    paddingBottom: "0pt",
                  }}
                >
                  <Text style={styles.fieldNumber}>4</Text>
                </View>
              </View>
              <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
              <View style={[styles.fieldLabel, { width: "285pt" }]}>
                <Text style={{ fontSize: 6 }}>
                  {t(`${prefix}.pdfContent.lot`)}: {formJson.buildingLocation?.lot || ""}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    marginTop: "4pt",
                    marginBottom: "0pt",
                    paddingBottom: "0pt",
                  }}
                >
                  <Text style={styles.fieldNumber}>7</Text>
                </View>
              </View>
            </View>

            <View style={[styles.formRow]}>
              <View style={[styles.fieldLabel, { width: "267pt" }]}>
                <Text style={{ fontSize: 6, textAlign: "left" }}>
                  {t(`${prefix}.pdfContent.city`)} & {t(`${prefix}.pdfContent.province`)}:{" "}
                  {formJson.buildingLocation?.city || ""}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    marginTop: "4pt",
                    marginBottom: "0pt",
                    paddingBottom: "0pt",
                  }}
                >
                  <Text style={styles.fieldNumber}>5</Text>
                </View>
              </View>
              <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
              <View style={[styles.fieldLabel, { width: "285pt" }]}>
                <Text style={{ fontSize: 6 }}>
                  {t(`${prefix}.pdfContent.postalCode`)}: {formJson.buildingLocation?.postalCode || ""}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    marginTop: "4pt",
                    marginBottom: "0pt",
                    paddingBottom: "0pt",
                  }}
                >
                  <Text style={styles.fieldNumber}>8</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Compliance Section */}
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1 }}></View>
              <Text style={{ fontFamily: "Times-Roman", fontSize: 10, fontWeight: "bold" }}>
                {t(`${prefix}.pdfContent.compliance`)}
              </Text>
              <View style={{ flex: 1, alignItems: "flex-end", marginRight: "10pt" }}>
                <Text
                  style={{ fontSize: 6, textTransform: "lowercase", fontWeight: "normal", fontFamily: "Helvetica" }}
                >
                  {t(`${prefix}.pdfContent.seePage2ForInputSummaryAndPage3ForRoomByRoomValues`)}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.formSection}>
            <View style={[styles.formRow, { minHeight: 17 }]}>
              <View style={[styles.fieldLabel, { flexDirection: "row", width: "265pt", fontSize: 6 }]}>
                <Text style={{ fontSize: 6, marginTop: "8pt", marginLeft: "5pt" }}>
                  {t(`${prefix}.pdfContent.submittalIsFor`)}:{" "}
                </Text>
                <LabeledCheckboxBox
                  checked={formJson.submissionType === "whole_house" || !formJson.submissionType}
                  text={t(`${prefix}.pdfContent.wholeHouse`)}
                  corner="aw"
                  width={120}
                  height={22}
                />
                <LabeledCheckboxBox
                  checked={formJson.submissionType === "room_by_room"}
                  text={t(`${prefix}.pdfContent.roomByRoom`)}
                  corner="ar"
                  width={120}
                  height={22}
                />
              </View>
              <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
              <View
                style={[
                  styles.fieldLabel,
                  { width: "285pt", flexDirection: "row", paddingLeft: "15pt", position: "relative" },
                ]}
              >
                <Text style={{ fontSize: 6, marginLeft: "15pt", marginTop: "8pt" }}>
                  {t(`${prefix}.pdfContent.units`)}:{" "}
                </Text>
                <View style={{ flexDirection: "row", marginLeft: "20pt", marginRight: "20pt" }}>
                  <Checkbox
                    checked={formJson.units === "imperial" || !formJson.units}
                    text={t(`${prefix}.pdfContent.imperial`)}
                  />
                </View>
                <Checkbox checked={formJson.units === "metric"} text={t(`${prefix}.pdfContent.metric`)} />
                <View style={{ position: "absolute", right: "2pt", top: "18pt" }}>
                  <Text style={styles.fieldNumber}>b</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Heating Section */}
          <Text style={[styles.sectionHeader, { paddingLeft: "245pt" }]}>{t(`${prefix}.pdfContent.heating`)}</Text>
          <View style={styles.formSection}>
            <View style={[styles.formRow, { borderBottom: "none" }]}>
              <View
                style={[
                  styles.fieldLabel,
                  { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingTop: 7 },
                ]}
              >
                <Text style={styles.boldText}>{t(`${prefix}.pdfContent.minimumHeatingCapacity`)}: </Text>
                <Text style={[styles.boldText, { border: "1pt solid black", padding: 5, width: "120pt" }]}>
                  {formJson.heating?.building || ""}{" "}
                </Text>
                <Text style={styles.smallText}> {t(`${prefix}.pdfContent.units`)} </Text>
                <Text style={styles.smallText}>({t(`${prefix}.pdfContent.totalBuildingHeatLossAsPer527`)})</Text>
                <View style={{ position: "absolute", right: "2pt", top: "18pt" }}>
                  <Text style={styles.fieldNumber}>c</Text>
                </View>
              </View>
            </View>
            <View style={[styles.formRow, { borderTop: "none" }]}>
              <View style={{ flex: 1, paddingLeft: 10, paddingRight: 5 }}>
                <View style={{ flexDirection: "row" }}>
                  <Text style={{ fontSize: 8, fontWeight: "bold", marginRight: 8 }}>
                    {t(`${prefix}.pdfContent.heating531`)}
                  </Text>
                  <Text style={{ fontSize: 8, lineHeight: 1.3, flex: 1 }}>
                    {t(`${prefix}.pdfContent.heating531HelpText`)}
                  </Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <Text style={{ fontSize: 8, fontWeight: "bold", marginRight: 8 }}>
                    {t(`${prefix}.pdfContent.heating532`)}
                  </Text>
                  <Text style={{ fontSize: 8, lineHeight: 1.3, flex: 1 }}>
                    {t(`${prefix}.pdfContent.heating532HelpText`)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Cooling Section */}
          <Text style={[styles.sectionHeader, { paddingLeft: "245pt" }]}>{t(`${prefix}.pdfContent.cooling`)}</Text>
          <View style={styles.formSection}>
            <View style={[styles.formRow, { borderBottom: "none" }]}>
              <View
                style={[
                  styles.fieldLabel,
                  { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingTop: 7 },
                ]}
              >
                <Text style={styles.boldText}>{t(`${prefix}.pdfContent.nominalCoolingCapacity`)}: </Text>
                <Text style={[styles.boldText, { border: "1pt solid black", padding: 5, width: "120pt" }]}>
                  {formJson.cooling?.nominal || ""}{" "}
                </Text>
                <Text> {t(`${prefix}.pdfContent.unitsHelpText2`)} </Text>
                <Text style={styles.smallText}>({t(`${prefix}.pdfContent.nominalCoolingCapacityAsPer631`)})</Text>
                <View style={{ position: "absolute", right: "2pt", top: "18pt" }}>
                  <Text style={styles.fieldNumber}>d</Text>
                </View>
              </View>
            </View>
            <View style={[styles.formRow, { borderBottom: "none" }]}>
              <View
                style={[
                  styles.fieldLabel,
                  { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingTop: 7 },
                ]}
              >
                <Text style={styles.boldText}>{t(`${prefix}.pdfContent.minimumCoolingCapacity`)}: </Text>
                <Text style={[styles.boldText, { border: "1pt solid black", padding: 5, width: "100pt" }]}>
                  {formJson.cooling?.minimumCoolingCapacity || ""}{" "}
                </Text>
                <Text> {t(`${prefix}.pdfContent.unitsHelpText2`)} </Text>
                <View style={{ position: "absolute", right: "2pt", top: "18pt" }}>
                  <Text style={styles.fieldNumber}>e</Text>
                </View>
              </View>
              <View
                style={[
                  styles.fieldLabel,
                  { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingTop: 7 },
                ]}
              >
                <Text style={styles.boldText}>{t(`${prefix}.pdfContent.maximumCoolingCapacity`)}: </Text>
                <Text style={[styles.boldText, { border: "1pt solid black", padding: 5, width: "100pt" }]}>
                  {formJson.cooling?.maximumCoolingCapacity || ""}{" "}
                </Text>
                <Text> {t(`${prefix}.pdfContent.unitsHelpText2`)} </Text>
                <View style={{ position: "absolute", right: "2pt", top: "18pt" }}>
                  <Text style={styles.fieldNumber}>f</Text>
                </View>
              </View>
            </View>
            <View style={[styles.formRow, { borderTop: "none" }]}>
              <View style={{ flex: 1, paddingLeft: 10, paddingRight: 5 }}>
                <View style={{ flexDirection: "row" }}>
                  <Text style={{ fontSize: 8, marginRight: 8 }}>{t(`${prefix}.pdfContent.cooling632`)}</Text>
                  <Text style={{ fontSize: 8, lineHeight: 1.3, flex: 1, paddingBottom: 2 }}>
                    {t(`${prefix}.pdfContent.cooling632HelpText`)}
                  </Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <Text style={{ fontSize: 8, marginRight: 8 }}>{t(`${prefix}.pdfContent.cooling633`)}</Text>
                  <Text style={{ fontSize: 8, lineHeight: 1.3, flex: 1, paddingBottom: 2 }}>
                    {t(`${prefix}.pdfContent.cooling633HelpText`)}
                  </Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <Text style={{ fontSize: 8, marginRight: 8 }}>{t(`${prefix}.pdfContent.cooling634`)}</Text>
                  <Text style={{ fontSize: 8, lineHeight: 1.3, flex: 1, paddingBottom: 2 }}>
                    {t(`${prefix}.pdfContent.cooling634HelpText`)}
                  </Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <Text style={{ fontSize: 8, marginRight: 8 }}>{t(`${prefix}.pdfContent.cooling635`)}</Text>
                  <Text style={{ fontSize: 8, lineHeight: 1.3, flex: 1, paddingBottom: 2 }}>
                    {t(`${prefix}.pdfContent.cooling635HelpText`)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Attached Documents */}
          <Text style={[styles.sectionHeader, { paddingLeft: "220pt" }]}>
            {t(`${prefix}.pdfContent.attachedDocuments`)}
          </Text>
          <View style={styles.formSection}>
            <View style={[styles.formRow, { minHeight: 25 }]}>
              <View style={{ flexDirection: "row", alignItems: "center", padding: 5 }}>
                <View style={{ flexDirection: "row", width: "200pt" }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Checkbox checked={true} text={t(`${prefix}.pdfContent.designSummary`)} />
                    <View style={{ position: "absolute", right: "0pt", top: "10pt" }}>
                      <Text style={styles.fieldNumber}>g</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Checkbox text={t(`${prefix}.pdfContent.roomByRoomResults`)} />
                    <View style={{ position: "absolute", right: "0pt", top: "10pt" }}>
                      <Text style={styles.fieldNumber}>h</Text>
                    </View>
                  </View>
                </View>
                <View style={{ width: "300pt" }}>
                  <Text style={{ fontSize: 6 }}>{t(`${prefix}.pdfContent.other`)}:</Text>
                  <View style={{ borderBottom: "1pt solid black", marginLeft: "15pt", width: "300pt" }}>
                    <Text style={{ fontSize: 6 }}>{(formJson.other || "").slice(0, 120)}</Text>
                  </View>
                  <View style={{ position: "absolute", right: "-30pt", top: "10pt" }}>
                    <Text style={styles.fieldNumber}>i</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={[styles.formRow, { minHeight: 15 }]}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 6, marginLeft: 5 }}>{t(`${prefix}.pdfContent.other`)}:</Text>
                <View style={{ width: "100%", marginLeft: 10, marginRight: 10, marginTop: 5 }}>
                  <Text style={{ fontSize: 6 }}>{(formJson.other || "").slice(120)}</Text>
                </View>
              </View>
              <View style={{ position: "absolute", right: "2pt", top: "8pt" }}>
                <Text style={styles.fieldNumber}>i</Text>
              </View>
            </View>
            <View style={[styles.formRow, { minHeight: 15 }]}>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ fontSize: 6, marginLeft: 5, paddingTop: 5 }}>{t(`${prefix}.pdfContent.notes`)}</Text>
                <View
                  style={{
                    borderBottom: "1pt solid black",
                    marginLeft: 10,
                    marginRight: 10,
                    marginBottom: 10,
                    marginTop: 5,
                    width: "500pt",
                  }}
                >
                  <Text style={{ fontSize: 6 }}>{formJson.notes || ""}</Text>
                </View>
              </View>
              <View style={{ position: "absolute", right: "2pt", top: "8pt" }}>
                <Text style={styles.fieldNumber}>j</Text>
              </View>
            </View>
          </View>
          <Text style={[styles.sectionHeader, { paddingLeft: "220pt" }]}>
            {t(`${prefix}.pdfContent.calculationsPerformedBy`)}
          </Text>
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1, border: "1pt solid black", borderTop: "none", borderRight: "none" }}>
              <View>
                {[
                  [
                    t(`${prefix}.pdfContent.calculationsPerformedByName`),
                    formJson.calculationPerformedBy?.name || "",
                    55,
                  ],
                  [
                    t(`${prefix}.pdfContent.calculationsPerformedByCompany`),
                    formJson.calculationPerformedBy?.company || "",
                    56,
                  ],
                  [
                    t(`${prefix}.pdfContent.calculationsPerformedByAddress`),
                    formJson.calculationPerformedBy?.address || "",
                    57,
                  ],
                  [
                    t(`${prefix}.pdfContent.calculationsPerformedByCityAndProvince`),
                    formJson.calculationPerformedBy?.city || "",
                    58,
                  ],
                  [
                    t(`${prefix}.pdfContent.calculationsPerformedByPostalCode`),
                    formJson.calculationPerformedBy?.postalCode || "",
                    59,
                  ],
                  [
                    t(`${prefix}.pdfContent.calculationsPerformedByPhone`),
                    formJson.calculationPerformedBy?.phone || "",
                    60,
                  ],
                  [
                    t(`${prefix}.pdfContent.calculationsPerformedByFax`),
                    formJson.calculationPerformedBy?.fax || "",
                    61,
                  ],
                  [
                    t(`${prefix}.pdfContent.calculationsPerformedByEmail`),
                    formJson.calculationPerformedBy?.email || "",
                    62,
                  ],
                ].map(([label, value, fieldNumber], index, arr) => (
                  <View
                    key={label}
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
                    {t(`${prefix}.pdfContent.accreditationReference1`)}:{" "}
                    {formJson.calculationPerformedBy?.reference1 || ""}
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
                    {t(`${prefix}.pdfContent.accreditationReference2`)}:{" "}
                    {formJson.calculationPerformedBy?.reference2 || ""}
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

          <View style={styles.bottomSection}>
            <View style={styles.bottomLeft}>
              <Text>
                {t(`${prefix}.pdfContent.areaForSoftwareVendorsInformationLogoContactInfoVersionNumber`)}:{" "}
                {formJson.calculationPerformedBy?.softwareInfo || ""}
              </Text>
              <View style={{ width: "365pt", color: "black", position: "relative", top: "17pt" }}>
                <Text style={styles.fieldNumber}>69</Text>
              </View>
            </View>
            <View style={styles.bottomRight}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                <Image src={logoPath} />
              </View>
            </View>
          </View>
        </View>
      </Page>
      <SingleZoneCoolingHeatingInputSummaryContent data={data} assetDirectoryPath={assetDirectoryPath} />
      <SingleZoneCoolingHeatingRoomByRoomContent data={data} assetDirectoryPath={assetDirectoryPath} />
    </Document>
  )
}
