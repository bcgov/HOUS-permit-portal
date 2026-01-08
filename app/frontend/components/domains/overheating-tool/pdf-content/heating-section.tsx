import { Text, View } from "@react-pdf/renderer"
import React from "react"
import { useTranslation } from "react-i18next"
import { pdfStyles as styles } from "../shared-pdf-styles"

interface HeatingSectionProps {
  formJson: any
  prefix: string
}

export const HeatingSection: React.FC<HeatingSectionProps> = ({ formJson, prefix }) => {
  const { t } = useTranslation() as any

  return (
    <>
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
    </>
  )
}
