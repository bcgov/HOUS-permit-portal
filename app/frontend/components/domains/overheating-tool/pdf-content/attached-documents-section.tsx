import { Text, View } from "@react-pdf/renderer"
import React from "react"
import { useTranslation } from "react-i18next"
import { Checkbox } from "../../../shared/pdf"
import { pdfStyles as styles } from "../shared-pdf-styles"

interface AttachedDocumentsSectionProps {
  formJson: any
  prefix: string
}

export const AttachedDocumentsSection: React.FC<AttachedDocumentsSectionProps> = ({ formJson, prefix }) => {
  const { t } = useTranslation() as any

  return (
    <>
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
    </>
  )
}
