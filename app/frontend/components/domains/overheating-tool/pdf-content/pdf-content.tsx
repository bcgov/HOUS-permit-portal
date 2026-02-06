import { Document, Image, Page, Text, View } from "@react-pdf/renderer"
import React from "react"
import { useTranslation } from "react-i18next"
import { pdfStyles as styles } from "../shared-pdf-styles"
import { AttachedDocumentsSection } from "./attached-documents-section"
import { BuildingLocationSection } from "./building-location-section"
import { CalculationsPerformedBySection } from "./calculations-performed-by-section"
import { ComplianceSection } from "./compliance-section"
import { CoolingSection } from "./cooling-section"
import { HeatingSection } from "./heating-section"
import { SingleZoneCoolingHeatingInputSummaryContent } from "./input-summary-content"
import { PDFHeader } from "./pdf-header"
import { SingleZoneCoolingHeatingRoomByRoomContent } from "./room-by-room-content"

interface PDFComponentProps {
  data: any
  assetDirectoryPath: string
}

export const SingleZoneCoolingHeatingPDFContent: React.FC<PDFComponentProps> = ({ data, assetDirectoryPath }) => {
  const formJson = data.formJson || {}

  const { t } = useTranslation() as any
  const prefix = "singleZoneCoolingHeatingTool"

  const logoPath = `${assetDirectoryPath}/images/f280/hvac-designers-of-canada-logo.png`

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.pageInner}>
          <PDFHeader formJson={formJson} prefix={prefix} />

          <BuildingLocationSection formJson={formJson} prefix={prefix} />

          <ComplianceSection formJson={formJson} prefix={prefix} />

          <HeatingSection formJson={formJson} prefix={prefix} />

          <CoolingSection formJson={formJson} prefix={prefix} />

          <AttachedDocumentsSection formJson={formJson} prefix={prefix} />

          <CalculationsPerformedBySection formJson={formJson} prefix={prefix} />

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
