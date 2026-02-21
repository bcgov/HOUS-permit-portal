import { Text, View } from "@react-pdf/renderer"
import React from "react"
import { useTranslation } from "react-i18next"
import { pdfStyles as styles } from "../shared-pdf-styles"

interface BuildingLocationSectionProps {
  formJson: any
  prefix: string
}

export const BuildingLocationSection: React.FC<BuildingLocationSectionProps> = ({ formJson, prefix }) => {
  const { t } = useTranslation() as any

  return (
    <>
      <Text style={[styles.sectionHeader, { paddingLeft: "226pt" }]}>{t(`${prefix}.pdfContent.buildingLocation`)}</Text>
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
    </>
  )
}
