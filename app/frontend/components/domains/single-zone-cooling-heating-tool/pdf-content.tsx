import { Document, Image, Page, Text, View } from "@react-pdf/renderer"
import React from "react"
import { useTranslation } from "react-i18next"
import { pdfStyles as styles } from "./shared-pdf-styles"

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

export const SingleZoneCoolingHeatingPDFContent: React.FC<PDFComponentProps> = ({ data, assetDirectoryPath }) => {
  const formJson = data.formJson || {}

  const { t } = useTranslation() as any
  const prefix = "singleZoneCoolingHeatingTool"

  const logoPath = `${assetDirectoryPath}/images/f280/hvac-designers-of-canada-logo.png`

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.headerTable}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={[styles.headerTitle, { fontWeight: "bold" }]}>{t(`${prefix}.pdfContent.title`)}</Text>
              <Text style={styles.headerSubtitle}>{t(`${prefix}.pdfContent.helpText`)}</Text>
            </View>
            <View style={[styles.headerRight, { backgroundColor: "#c0c0c0" }]}>
              <Text style={{ fontSize: 7, fontWeight: "normal", padding: 0, margin: 0 }}>
                {t(`${prefix}.pdfContent.CSAF28012`)}
              </Text>
              <Text style={{ fontSize: 7, fontWeight: "normal", padding: 0, margin: 0 }}>
                {t(`${prefix}.pdfContent.setVer`)}
              </Text>
            </View>
          </View>
          <View style={styles.headerRow}>
            <View style={styles.headerLeftNoBg}>
              <Text style={{ fontSize: 6, paddingLeft: 5 }}>
                {t(`${prefix}.pdfContent.theseDocumentsIssuedForTheUseOf`)}{" "}
                <Text style={{ textDecoration: "underline" }}>{formJson.drawingIssueFor || ""}</Text>
              </Text>
              <Text style={{ fontSize: 6, paddingLeft: 5 }}>
                {t(`${prefix}.pdfContent.andMayNotBeUsedByAnyOtherPersonsWithoutAuthorization`)}
              </Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={{ fontWeight: "bold", fontSize: 6 }}>{t(`${prefix}.pdfContent.projectNumber`)}</Text>
              <View style={{ minHeight: 15, paddingLeft: 2 }}>
                <Text style={{ fontSize: 6 }}>{formJson.projectNumber || ""}</Text>
              </View>
            </View>
          </View>
        </View>
        <Text style={styles.sectionHeader}>{t(`${prefix}.pdfContent.buildingLocation`)}</Text>
        <View style={styles.formSection}>
          <View style={[styles.formRow, { minHeight: 17 }]}>
            <View style={[styles.fieldLabel, { flex: 1 }]}>
              <Text style={{ fontSize: 6, textAlign: "left" }}>
                {t(`${prefix}.pdfContent.model`)}: {formJson.buildingLocation?.model || ""}
              </Text>
            </View>
            <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
            <View style={[styles.fieldLabel, { flex: 1 }]}>
              <Text style={{ fontSize: 6 }}>
                {t(`${prefix}.pdfContent.site`)}: {formJson.buildingLocation?.site || ""}
              </Text>
            </View>
          </View>

          <View style={[styles.formRow, { minHeight: 17 }]}>
            <View style={[styles.fieldLabel, { flex: 1 }]}>
              <Text style={{ fontSize: 6 }}>
                {t(`${prefix}.pdfContent.address`)}: {formJson.buildingLocation?.address || ""}
              </Text>
            </View>
            <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
            <View style={[styles.fieldLabel, { flex: 1 }]}>
              <Text style={{ fontSize: 6 }}>
                {t(`${prefix}.pdfContent.lot`)}: {formJson.buildingLocation?.lot || ""}
              </Text>
            </View>
          </View>

          <View style={[styles.formRow, { minHeight: 17 }]}>
            <View style={[styles.fieldLabel, { flex: 1 }]}>
              <Text style={{ fontSize: 6 }}>
                {t(`${prefix}.pdfContent.city`)} & {t(`${prefix}.pdfContent.province`)}:{" "}
                {formJson.buildingLocation?.city || ""}
              </Text>
            </View>
            <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
            <View style={[styles.fieldLabel, { flex: 1 }]}>
              <Text style={{ fontSize: 6 }}>
                {t(`${prefix}.pdfContent.postalCode`)}: {formJson.buildingLocation?.postalCode || ""}
              </Text>
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
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={{ fontSize: 7, fontWeight: "normal", fontFamily: "Helvetica" }}>
                {t(`${prefix}.pdfContent.seePage2ForInputSummaryAndPage3ForRoomByRoomValues`)}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.formSection}>
          <View style={[styles.formRow, { minHeight: 17 }]}>
            <View style={[styles.fieldLabel, { flex: 1, flexDirection: "row", alignItems: "center", fontSize: 6 }]}>
              <Text style={{ fontSize: 6 }}>{t(`${prefix}.pdfContent.submittalIsFor`)}: </Text>
              <Checkbox
                checked={formJson.submissionType === "whole_house" || !formJson.submissionType}
                text={t(`${prefix}.pdfContent.wholeHouse`)}
              />
              <Checkbox
                checked={formJson.submissionType === "room_by_room"}
                text={t(`${prefix}.pdfContent.roomByRoom`)}
              />
            </View>
            <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
            <View style={[styles.fieldLabel, { flex: 1, flexDirection: "row", alignItems: "center" }]}>
              <Text style={{ fontSize: 6 }}>{t(`${prefix}.pdfContent.units`)}: </Text>
              <Checkbox
                checked={formJson.units === "imperial" || !formJson.units}
                text={t(`${prefix}.pdfContent.imperial`)}
              />
              <Checkbox checked={formJson.units === "metric"} text={t(`${prefix}.pdfContent.metric`)} />
            </View>
          </View>
        </View>

        {/* Heating Section */}
        <Text style={styles.sectionHeader}>{t(`${prefix}.pdfContent.heating`)}</Text>
        <View style={styles.formSection}>
          <View style={[styles.formRow, { borderBottom: "none" }]}>
            <View
              style={[
                styles.fieldLabel,
                { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingTop: 7 },
              ]}
            >
              <Text style={styles.boldText}>{t(`${prefix}.pdfContent.minimumHeatingCapacity`)}: </Text>
              <Text style={[styles.boldText, { border: "1pt solid black", padding: 5 }]}>
                {formJson.heating?.building || ""}{" "}
              </Text>
              <Text> {t(`${prefix}.pdfContent.units`)} </Text>
              <Text style={styles.smallText}>({t(`${prefix}.pdfContent.totalBuildingHeatLossAsPer527`)})</Text>
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
        <Text style={styles.sectionHeader}>{t(`${prefix}.pdfContent.cooling`)}</Text>
        <View style={styles.formSection}>
          <View style={[styles.formRow, { borderBottom: "none" }]}>
            <View
              style={[
                styles.fieldLabel,
                { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingTop: 7 },
              ]}
            >
              <Text style={styles.boldText}>{t(`${prefix}.pdfContent.nominalCoolingCapacity`)}: </Text>
              <Text style={[styles.boldText, { border: "1pt solid black", padding: 5 }]}>
                {formJson.cooling?.nominal || ""}{" "}
              </Text>
              <Text> {t(`${prefix}.pdfContent.unitsHelpText2`)} </Text>
              <Text style={styles.smallText}>({t(`${prefix}.pdfContent.nominalCoolingCapacityAsPer631`)})</Text>
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
              <Text style={[styles.boldText, { border: "1pt solid black", padding: 5 }]}>
                {formJson.cooling?.minimumCoolingCapacity || ""}{" "}
              </Text>
              <Text> {t(`${prefix}.pdfContent.unitsHelpText2`)} </Text>
            </View>
            <View
              style={[
                styles.fieldLabel,
                { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingTop: 7 },
              ]}
            >
              <Text style={styles.boldText}>{t(`${prefix}.pdfContent.maximumCoolingCapacity`)}: </Text>
              <Text style={[styles.boldText, { border: "1pt solid black", padding: 5 }]}>
                {formJson.cooling?.maximumCoolingCapacity || ""}{" "}
              </Text>
              <Text> {t(`${prefix}.pdfContent.unitsHelpText2`)} </Text>
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
        <Text style={styles.sectionHeader}>{t(`${prefix}.pdfContent.attachedDocuments`)}</Text>
        <View style={styles.formSection}>
          <View style={[styles.formRow, { minHeight: 25 }]}>
            <View style={{ flexDirection: "row", alignItems: "center", padding: 5 }}>
              <Checkbox checked={true} text={t(`${prefix}.pdfContent.designSummary`)} />
              <Checkbox text={t(`${prefix}.pdfContent.roomByRoomResults`)} />
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                <Text style={{ fontSize: 7 }}>{t(`${prefix}.pdfContent.other`)}:</Text>
                <View style={{ borderBottom: "1pt solid black", marginLeft: 10, marginRight: 20 }}>
                  <Text style={{ fontSize: 7 }}>{formJson.other || ""}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={[styles.formRowLast, { minHeight: 15 }]}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 7, marginLeft: 5 }}>{t(`${prefix}.pdfContent.other`)}:</Text>
              <View style={{ borderBottom: "1pt solid black", flex: 1, marginLeft: 10, marginRight: 10, marginTop: 5 }}>
                <Text style={{ fontSize: 7, color: "transparent" }}>.</Text>
              </View>
            </View>
          </View>
          <View style={[styles.formRowLast, { minHeight: 15 }]}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 8, marginLeft: 5, paddingTop: 5 }}>{t(`${prefix}.pdfContent.notes`)}:</Text>
              <View
                style={{
                  borderBottom: "1pt solid black",
                  flex: 1,
                  marginLeft: 10,
                  marginRight: 10,
                  marginBottom: 10,
                  marginTop: 5,
                }}
              >
                <Text style={{ fontSize: 8 }}>{formJson.notes || ""}</Text>
              </View>
            </View>
          </View>
        </View>
        <Text style={[styles.sectionHeader, { borderTop: "1pt solid black" }]}>
          {t(`${prefix}.pdfContent.calculationsPerformedBy`)}
        </Text>
        <View style={{ flexDirection: "row", minHeight: 200 }}>
          <View style={{ flex: 1, border: "1pt solid black", borderTop: "none", borderRight: "none" }}>
            <View>
              {[
                [
                  t(`${prefix}.pdfContent.calculationsPerformedByName`),
                  formJson.calculationPerformedBy?.attestation || "",
                ],
                [
                  t(`${prefix}.pdfContent.calculationsPerformedByCompany`),
                  formJson.calculationPerformedBy?.company || "",
                ],
                [
                  t(`${prefix}.pdfContent.calculationsPerformedByAddress`),
                  formJson.calculationPerformedBy?.address || "",
                ],
                [
                  t(`${prefix}.pdfContent.calculationsPerformedByCityAndProvince`),
                  formJson.calculationPerformedBy?.city || "",
                ],
                [
                  t(`${prefix}.pdfContent.calculationsPerformedByPostalCode`),
                  formJson.calculationPerformedBy?.postalCode || "",
                ],
                [t(`${prefix}.pdfContent.calculationsPerformedByPhone`), formJson.calculationPerformedBy?.phone || ""],
                [t(`${prefix}.pdfContent.calculationsPerformedByFax`), formJson.calculationPerformedBy?.fax || ""],
                [t(`${prefix}.pdfContent.calculationsPerformedByEmail`), formJson.calculationPerformedBy?.email || ""],
              ].map(([label, value], index) => (
                <View
                  key={label}
                  style={{ flexDirection: "row", marginBottom: 2, borderBottom: "1pt solid black", padding: 5 }}
                >
                  <Text style={{ fontSize: 7 }}>{label}</Text>
                  <Text style={{ fontSize: 7, flex: 1 }}>{value}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ flex: 1, border: "1pt solid black", borderTop: "none", borderRight: "none" }}>
            <View style={{ padding: 5, position: "relative", minHeight: 160 }}>
              <View
                style={{
                  transform: "rotate(-25deg)",
                  position: "absolute",
                  top: 80,
                  left: 5,
                  color: "blue",
                  fontSize: 11,
                }}
              >
                <Text>{t(`${prefix}.pdfContent.designersSignatureStampDigitalOrOtherCertificationMark`)}</Text>
              </View>
            </View>
          </View>

          <View style={{ flex: 1, border: "1pt solid black", borderTop: "none" }}>
            <View>
              <Text style={{ fontSize: 7, marginTop: 10, marginLeft: 2 }}>
                {t(`${prefix}.pdfContent.attestation`)} {formJson.calculationPerformedBy?.attestation || ""}
              </Text>
              <Text style={{ fontSize: 7, marginTop: 5, marginLeft: 2 }}>
                {t(`${prefix}.pdfContent.attestationHelpText`)}
              </Text>
              <Text style={{ fontSize: 6, paddingBottom: 2, paddingTop: 5, paddingLeft: 2 }}>
                {t(`${prefix}.pdfContent.accreditation`)}
              </Text>
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
              <Text style={{ fontSize: 6, paddingBottom: 2, paddingTop: 5, paddingLeft: 2 }}>
                {t(`${prefix}.pdfContent.accreditation`)}
              </Text>
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
              <Text style={{ fontSize: 6, paddingBottom: 2, paddingTop: 5, paddingLeft: 2 }}>
                {t(`${prefix}.pdfContent.issuedForDate`)}: {formJson.calculationPerformedBy?.issuedForDate || ""}
              </Text>
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
                {t(`${prefix}.pdfContent.issuedForDate2`)}: {formJson.calculationPerformedBy?.issuedForDate2 || ""}
              </Text>
              <Text
                style={{
                  fontSize: 6,
                  paddingBottom: 5,
                  paddingTop: 2,
                  borderBottom: "1pt solid black",
                  paddingLeft: 2,
                }}
              ></Text>
              <Text style={{ fontSize: 10, fontWeight: "bold", textAlign: "center", marginTop: 10 }}>
                {t(`${prefix}.pdfContent.page`)}
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <View style={styles.bottomLeft}>
            <Text>
              {t(`${prefix}.pdfContent.areaForSoftwareVendorsInformationLogoContactInfoVersionNumber`)}:{" "}
              {formJson.calculationPerformedBy?.softwareInfo || ""}
            </Text>
          </View>
          <View style={styles.bottomRight}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
              <Image src={logoPath} />
            </View>
          </View>
        </View>

        {/* Footer */}
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
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 8 }}>
              {t(`${prefix}.pdfContent.F280FormsSet2410xlsxCover`)}:{" "}
              {formJson.calculationBasedOn?.F280FormsSet2410xlsxCover || ""}
            </Text>
            <Text style={{ fontSize: 8 }}>{new Date().toLocaleDateString()}</Text>
          </View>
        </View>
      </Page>
      {/* <SingleZoneCoolingHeatingInputSummaryContent data={data} assetDirectoryPath={assetDirectoryPath} />
      <SingleZoneCoolingHeatingRoomByRoomContent data={data} assetDirectoryPath={assetDirectoryPath} /> */}
    </Document>
  )
}
