import { Image, Page, Text, View } from "@react-pdf/renderer"
import React from "react"
import { useTranslation } from "react-i18next"
import { pdfStyles as styles } from "./shared-pdf-styles"

interface PDFComponentProps {
  data: any
  assetDirectoryPath: string
}

export const SingleZoneCoolingHeatingRoomByRoomContent: React.FC<PDFComponentProps> = ({
  data,
  assetDirectoryPath,
}) => {
  const formJson = data.formJson || {}
  const { t } = useTranslation()
  const prefix = "singleZoneCoolingHeatingTool.pdfContent.roomByRoomCalculationResults"
  const logoPath = `${assetDirectoryPath}/images/f280/hvac-designers-of-canada-logo.png`

  const roomData = Array.from({ length: 39 }, (_, index) => ({
    number: index + 1,
    name: "",
    heating: "",
    cooling: "",
  }))

  return (
    <Page size="LETTER" style={styles.page}>
      <View style={styles.headerTable}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { fontWeight: "bold" }]}>{t(`${prefix}.title`)}</Text>
          </View>
          <View style={[styles.headerRight, { backgroundColor: "#c0c0c0" }]}>
            <Text style={{ fontSize: 4, fontWeight: "normal" }}>{t(`${prefix}.CSAF28012`)}</Text>
            <Text>{t(`${prefix}.FormSetVer2410`)}</Text>
            <Text style={{ fontWeight: "bold", fontSize: 6 }}>{t(`${prefix}.project`)}</Text>
          </View>
        </View>
        <View style={styles.headerRow}>
          <View style={styles.headerLeftNoBg}>
            <Text style={{ fontSize: 6, paddingLeft: 5 }}>
              {t(`${prefix}.theseDocumentsIssuedForTheUseOf`)}{" "}
              <Text style={{ textDecoration: "underline" }}>{formJson.issuedFor || ""}</Text>
            </Text>
            <Text style={{ fontSize: 6, paddingLeft: 5 }}>
              {t(`${prefix}.andMayNotBeUsedByAnyOtherPersonsWithoutAuthorization`)}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={{ minHeight: 15, paddingLeft: 2 }}>
              <Text style={{ fontSize: 6 }}>{formJson.projectNumber || ""}</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.sectionHeader}>{t(`${prefix}.buildingLocation`)}</Text>
      <View style={styles.formSection}>
        <View style={[styles.formRow, { minHeight: 17 }]}>
          <View style={[styles.fieldLabel, { width: 300 }]}>
            <Text style={{ fontSize: 7 }}>{t(`${prefix}.model`)}:</Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 150 }]}>
            <Text style={{ fontSize: 7 }}>{t(`${prefix}.site`)}:</Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 150 }]}>
            <Text style={{ fontSize: 7 }}>{t(`${prefix}.lot`)}:</Text>
          </View>
        </View>
        <View style={[styles.formRowLast, { minHeight: 17 }]}>
          <View style={[styles.fieldLabel, { width: 300 }]}>
            <Text style={{ fontSize: 7 }}>{t(`${prefix}.address`)}:</Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 150 }]}>
            <Text style={{ fontSize: 7 }}>
              {t(`${prefix}.city`)}/{t(`${prefix}.province`)}:
            </Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 17, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 150 }]}>
            <Text style={{ fontSize: 7 }}>{t(`${prefix}.postalCode`)}:</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.sectionHeader, { borderTop: "1pt solid black" }]}>
        {t(`${prefix}.calculationResultsRoomByRoom`)}
      </Text>
      <View style={styles.formSection}>
        <View style={[styles.formRow, { minHeight: 15 }]}>
          <View style={[styles.fieldLabel, { width: 20, textAlign: "center" }]}>
            <Text style={{ fontSize: 8, fontWeight: "bold" }}>#</Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 15, width: 1 }}></View>
          <View style={[styles.fieldLabel, { flex: 1, textAlign: "center" }]}>
            <Text style={{ fontSize: 8, fontWeight: "bold" }}>{t(`${prefix}.roomName`)}</Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 15, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 80, textAlign: "center" }]}>
            <Text style={{ fontSize: 7, fontWeight: "bold" }}>{t(`${prefix}.heating`)}</Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 15, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 80, textAlign: "center" }]}>
            <Text style={{ fontSize: 7, fontWeight: "bold" }}>{t(`${prefix}.cooling`)}</Text>
          </View>
        </View>

        {roomData.map((room, index) => (
          <View key={room.number} style={[styles.formRow, { minHeight: 12 }]}>
            <View style={[styles.fieldLabel, { width: 20, textAlign: "center" }]}>
              <Text style={{ fontSize: 6 }}>{room.number}</Text>
            </View>
            <View style={{ borderLeft: "1pt solid black", minHeight: 12, width: 1 }}></View>
            <View style={[styles.fieldLabel, { flex: 1 }]}>
              <Text style={{ fontSize: 6 }}>{room.name}</Text>
            </View>
            <View style={{ borderLeft: "1pt solid black", minHeight: 12, width: 1 }}></View>
            <View style={[styles.fieldLabel, { width: 80, textAlign: "center" }]}>
              <Text style={{ fontSize: 6 }}>{room.heating}</Text>
            </View>
            <View style={{ borderLeft: "1pt solid black", minHeight: 12, width: 1 }}></View>
            <View style={[styles.fieldLabel, { width: 80, textAlign: "center" }]}>
              <Text style={{ fontSize: 6 }}>{room.cooling}</Text>
            </View>
          </View>
        ))}

        <View style={[styles.formRow, { minHeight: 14 }]}>
          <View style={[styles.fieldLabel, { flex: 1, alignItems: "flex-end" }]}>
            <Text style={{ fontSize: 7, fontWeight: "bold", paddingLeft: 5 }}>{t(`${prefix}.ventilationLoss`)}</Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 14, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 80, textAlign: "center" }]}>
            <Text style={{ fontSize: 7, fontWeight: "bold" }}>{t(`${prefix}.BtuPerH`)}</Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 14, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 80, textAlign: "center" }]}>
            <Text style={{ fontSize: 7, fontWeight: "bold" }}>{t(`${prefix}.BtuPerH`)}</Text>
          </View>
        </View>

        <View style={[styles.formRow, { minHeight: 14 }]}>
          <View style={[styles.fieldLabel, { flex: 1, alignItems: "flex-end" }]}>
            <Text style={{ fontSize: 7, fontWeight: "bold", paddingRight: 5, textAlign: "right" }}>
              {t(`${prefix}.totalBuildingLoss`)}
            </Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 14, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 80, textAlign: "center" }]}>
            <Text style={{ fontSize: 7, fontWeight: "bold" }}>{t(`${prefix}.BtuPerH`)}</Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 14, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 80, textAlign: "center" }]}>
            <Text style={{ fontSize: 7, fontWeight: "bold" }}>{t(`${prefix}.BtuPerH`)}</Text>
          </View>
        </View>
        <View style={[styles.formRow, { minHeight: 14 }]}>
          <View style={[styles.fieldLabel, { flex: 1, alignItems: "flex-end" }]}>
            <Text style={{ fontSize: 7, paddingLeft: 5 }}>
              {t(`${prefix}.seePage1ForHeatingAndCoolingSystemCapacityLimits`)}
            </Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 14, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 80, textAlign: "center" }]}>
            <Text style={{ fontSize: 7 }}>{t(`${prefix}.issued`)}:</Text>
          </View>
          <View style={{ borderLeft: "1pt solid black", minHeight: 14, width: 1 }}></View>
          <View style={[styles.fieldLabel, { width: 80, textAlign: "center" }]}>
            <Text style={{ fontSize: 7, fontWeight: "bold" }}>{t(`${prefix}.page3Of`)} 3</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.bottomLeft}>
          <Text style={{ color: "blue", fontSize: 8 }}>
            {t(`${prefix}.areaForSoftwareVendorsInformationLogoContactInfoVersionNumber`)}
          </Text>
        </View>
        <View style={styles.bottomRight}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
            <Image src={logoPath} style={{ width: 120, height: 40 }} />
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
        <Text style={{ fontSize: 8 }}>{t(`${prefix}.F280FormsSet2410xlsxResults`)}</Text>
        <Text style={{ fontSize: 8 }}>
          {new Date().toLocaleTimeString()}, {new Date().toLocaleDateString()}
        </Text>
      </View>
    </Page>
  )
}
