import { Text, View } from "@react-pdf/renderer"
import React from "react"
import { useTranslation } from "react-i18next"
import { Checkbox, LabeledCheckboxBox } from "../../../shared/pdf"
import { pdfStyles as styles } from "../shared-pdf-styles"

interface ComplianceSectionProps {
  formJson: any
  prefix: string
}

export const ComplianceSection: React.FC<ComplianceSectionProps> = ({ formJson, prefix }) => {
  const { t } = useTranslation() as any

  return (
    <>
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flex: 1 }}></View>
          <Text style={{ fontFamily: "Times-Roman", fontSize: 10, fontWeight: "bold" }}>
            {t(`${prefix}.pdfContent.compliance`)}
          </Text>
          <View style={{ flex: 1, alignItems: "flex-end", marginRight: "10pt" }}>
            <Text style={{ fontSize: 6, textTransform: "lowercase", fontWeight: "normal", fontFamily: "Helvetica" }}>
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
    </>
  )
}
