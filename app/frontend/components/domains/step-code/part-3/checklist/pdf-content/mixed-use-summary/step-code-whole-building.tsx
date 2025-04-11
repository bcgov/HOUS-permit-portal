import { Text, View } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IPart3ComplianceReport } from "../../../../../../../types/types"
import { Input } from "../../../../part-9/checklist/pdf-content/shared/field"
import { styles } from "./styles"

interface IProps {
  requirements: IPart3ComplianceReport["performance"]["requirements"]
  compliance: IPart3ComplianceReport["performance"]["complianceSummary"]
  prefix: string
}

export const StepCodeWholeBuildingPdf = ({ requirements, compliance, prefix }: IProps) => (
  <View style={styles.table}>
    <View style={styles.tableRow}>
      <View style={{ ...styles.tableCell, ...styles.tableHeaderCell, flex: 2 }}></View>
      <View style={{ ...styles.tableCell, ...styles.tableHeaderCell, flex: 1 }}>
        <Text>TEUI</Text>
      </View>
      <View style={{ ...styles.tableCell, ...styles.tableHeaderCell, flex: 1 }}>
        <Text>TEDI</Text>
      </View>
      <View style={{ ...styles.tableCell, ...styles.tableHeaderCell, flex: 1 }}>
        <Text>GHGI</Text>
      </View>
    </View>
    <View style={styles.tableRow}>
      <View style={{ ...styles.tableCell, flex: 2, textAlign: "left" }}>
        <Text>{t(`${prefix}.requirements`)}</Text>
      </View>
      <View style={{ ...styles.tableCell, flex: 1 }}>
        <Input isDisabled value={requirements?.wholeBuilding?.stepCode?.teui || "-"} inputStyles={styles.inputStyle} />
      </View>
      <View style={{ ...styles.tableCell, flex: 1 }}>
        <Input isDisabled value={requirements?.wholeBuilding?.stepCode?.tedi || "-"} inputStyles={styles.inputStyle} />
      </View>
      <View style={{ ...styles.tableCell, flex: 1 }}>
        <Input isDisabled value={requirements?.wholeBuilding?.stepCode?.ghgi || "-"} inputStyles={styles.inputStyle} />
      </View>
    </View>
    <View style={styles.tableRow}>
      <View style={{ ...styles.tableCell, flex: 2, textAlign: "left" }}>
        <Text>{t(`${prefix}.performance`)}</Text>
      </View>
      <View style={{ ...styles.tableCell, flex: 1 }}>
        <Input isDisabled value={compliance?.teui?.wholeBuilding || "-"} inputStyles={styles.inputStyle} />
      </View>
      <View style={{ ...styles.tableCell, flex: 1 }}>
        <Input isDisabled value={compliance?.tedi?.wholeBuilding || "-"} inputStyles={styles.inputStyle} />
      </View>
      <View style={{ ...styles.tableCell, flex: 1 }}>
        <Input isDisabled value={compliance?.ghgi?.wholeBuilding || "-"} inputStyles={styles.inputStyle} />
      </View>
    </View>
    <View style={styles.tableRow}>
      <View style={{ ...styles.tableCell, flex: 2, textAlign: "left" }}>
        <Text>{t(`${prefix}.compliance`)}</Text>
      </View>
      <View style={{ ...styles.tableCell, flex: 1 }}>
        <Input
          isDisabled
          // Note: _disabled prop doesn't exist on the PDF Input component
          // style={ compliance?.teui?.wholeBuildingComplies ? { backgroundColor: theme.colors.semantic.infoLight } : { backgroundColor: theme.colors.semantic.errorLight } }
          value={compliance?.teui?.wholeBuildingComplies ? t("ui.yes") : t("ui.no")}
          inputStyles={styles.inputStyle}
        />
      </View>
      <View style={{ ...styles.tableCell, flex: 1 }}>
        <Input
          isDisabled
          // Note: _disabled prop doesn't exist on the PDF Input component
          // style={ compliance?.tedi?.wholeBuildingComplies ? { backgroundColor: theme.colors.semantic.infoLight } : { backgroundColor: theme.colors.semantic.errorLight } }
          value={compliance?.tedi?.wholeBuildingComplies ? t("ui.yes") : t("ui.no")}
          inputStyles={styles.inputStyle}
        />
      </View>
      <View style={{ ...styles.tableCell, flex: 1 }}>
        <Input
          isDisabled
          // Note: _disabled prop doesn't exist on the PDF Input component
          // style={ compliance?.ghgi?.wholeBuildingComplies ? { backgroundColor: theme.colors.semantic.infoLight } : { backgroundColor: theme.colors.semantic.errorLight } }
          value={compliance?.ghgi?.wholeBuildingComplies ? t("ui.yes") : t("ui.no")}
          inputStyles={styles.inputStyle}
        />
      </View>
    </View>
  </View>
)
