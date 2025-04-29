import { Text, View } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { Trans } from "react-i18next"
import { IPart3ComplianceMetricsNestedTEDI, IPart3ComplianceReport } from "../../../../../../../types/types"
import { Input } from "../../../../part-9/checklist/pdf-content/shared/field"
import { styles } from "./styles"

interface IProps {
  requirements: IPart3ComplianceReport["performance"]["requirements"]
  adjustedResults: IPart3ComplianceMetricsNestedTEDI
  complianceSummary: IPart3ComplianceMetricsNestedTEDI
}

const prefix = "stepCode.part3.stepCodeSummary.mixedUse.wholeBuilding"

// Helper function for formatting numbers or returning '-'
const formatValue = (value: string | number | undefined | null, options?: { decimals?: number }): string => {
  const decimals = options?.decimals ?? 0
  if (value === null || value === undefined || value === "" || isNaN(Number(value))) {
    return "-"
  }
  return parseFloat(String(value)).toFixed(decimals)
}

export const StepCodeWholeBuildingPdf = ({ requirements, adjustedResults, complianceSummary }: IProps) => {
  const teuiComplies = !!complianceSummary.teui
  const tediComplies = !!complianceSummary.tedi?.wholeBuilding
  const ghgiComplies = !!complianceSummary.ghgi

  // Check if GHGI requirement exists to determine NA vs No
  const hasGhgiRequirement = !!requirements?.wholeBuilding?.ghgi

  return (
    <View style={styles.table}>
      <View style={styles.tableRow}>
        <View style={{ ...styles.tableCell, ...styles.tableHeaderCell, flex: 2 }}></View>
        <View style={{ ...styles.tableCell, ...styles.tableHeaderCell, flex: 1 }}>
          <Text>{t("stepCode.part3.metrics.teui.label")}</Text>
          <Text style={styles.smallText}>
            <Trans i18nKey={"stepCode.part3.metrics.teui.units"} components={{ sup: <Text /> }} />
          </Text>
        </View>
        <View style={{ ...styles.tableCell, ...styles.tableHeaderCell, flex: 1 }}>
          <Text>{t("stepCode.part3.metrics.tedi.label")}</Text>
          <Text style={styles.smallText}>
            <Trans i18nKey={"stepCode.part3.metrics.tedi.units"} components={{ sup: <Text /> }} />
          </Text>
        </View>
        <View style={{ ...styles.tableCell, ...styles.tableHeaderCell, flex: 1 }}>
          <Text>{t("stepCode.part3.metrics.ghgi.label")}</Text>
          <Text style={styles.smallText}>
            <Trans i18nKey={"stepCode.part3.metrics.ghgi.units"} components={{ sup: <Text /> }} />
          </Text>
        </View>
      </View>
      <View style={styles.tableRow}>
        <View style={{ ...styles.tableCell, flex: 2, textAlign: "left" }}>
          <Text>{t(`${prefix}.requirements`)}</Text>
        </View>
        <View style={{ ...styles.tableCell, flex: 1 }}>
          <Input
            value={formatValue(requirements?.wholeBuilding?.teui, { decimals: 2 })}
            inputStyles={styles.inputStyle}
          />
        </View>
        <View style={{ ...styles.tableCell, flex: 1 }}>
          <Input
            value={formatValue(requirements?.wholeBuilding?.tedi, { decimals: 2 })}
            inputStyles={styles.inputStyle}
          />
        </View>
        <View style={{ ...styles.tableCell, flex: 1 }}>
          <Input
            value={formatValue(requirements?.wholeBuilding?.ghgi, { decimals: 2 })}
            inputStyles={styles.inputStyle}
          />
        </View>
      </View>
      <View style={styles.tableRow}>
        <View style={{ ...styles.tableCell, flex: 2, textAlign: "left" }}>
          <Text>{t(`${prefix}.performance`)}</Text>
        </View>
        <View style={{ ...styles.tableCell, flex: 1 }}>
          <Input value={formatValue(adjustedResults?.teui, { decimals: 2 })} inputStyles={styles.inputStyle} />
        </View>
        <View style={{ ...styles.tableCell, flex: 1 }}>
          <Input
            value={formatValue(adjustedResults?.tedi?.wholeBuilding, { decimals: 2 })}
            inputStyles={styles.inputStyle}
          />
        </View>
        <View style={{ ...styles.tableCell, flex: 1 }}>
          <Input value={formatValue(adjustedResults?.ghgi, { decimals: 2 })} inputStyles={styles.inputStyle} />
        </View>
      </View>
      <View style={styles.tableRow}>
        <View style={{ ...styles.tableCell, flex: 2, textAlign: "left" }}>
          <Text>{t(`${prefix}.compliance`)}</Text>
        </View>
        <View style={{ ...styles.tableCell, flex: 1 }}>
          <Input
            // TODO: Add conditional styling based on compliance status if needed for PDF
            value={teuiComplies ? t("ui.yes") : t("ui.no")}
            inputStyles={styles.inputStyle}
          />
        </View>
        <View style={{ ...styles.tableCell, flex: 1 }}>
          <Input
            // TODO: Add conditional styling
            value={tediComplies ? t("ui.yes") : t("ui.no")}
            inputStyles={styles.inputStyle}
          />
        </View>
        <View style={{ ...styles.tableCell, flex: 1 }}>
          <Input
            // TODO: Add conditional styling
            value={ghgiComplies ? t("ui.yes") : hasGhgiRequirement ? t("ui.no") : t("ui.na")}
            inputStyles={styles.inputStyle}
          />
        </View>
      </View>
    </View>
  )
}
