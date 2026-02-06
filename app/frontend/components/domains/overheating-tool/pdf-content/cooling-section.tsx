import { Text, View } from "@react-pdf/renderer"
import React from "react"
import { useTranslation } from "react-i18next"
import { pdfStyles as styles } from "../shared-pdf-styles"

interface CoolingSectionProps {
  formJson: any
  prefix: string
}

export const CoolingSection: React.FC<CoolingSectionProps> = ({ formJson, prefix }) => {
  const { t } = useTranslation() as any

  return (
    <>
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
    </>
  )
}
