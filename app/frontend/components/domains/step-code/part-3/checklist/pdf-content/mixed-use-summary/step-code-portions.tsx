import { View } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IPart3ComplianceReport } from "../../../../../../../types/types"
import { Text } from "../../../../../../shared/pdf/text"
import { Input } from "../../../../part-9/checklist/pdf-content/shared/field"
import { styles } from "./styles"

interface IProps {
  requirements: IPart3ComplianceReport["performance"]["requirements"]
  compliance: IPart3ComplianceReport["performance"]["complianceSummary"]
  adjustedResults: IPart3ComplianceReport["performance"]["adjustedResults"]
}

export const StepCodePortionsPdf = ({ requirements, adjustedResults, compliance }: IProps) => {
  const tediComplies = !!compliance?.tedi?.stepCodePortion

  const prefix = "stepCode.part3.stepCodeSummary.mixedUse.stepCode"

  return (
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
          <Text>{t(`${prefix}.requirement`)}</Text>
        </View>
        <View style={{ ...styles.tableCell, flex: 1 }}>
          <Input value="-" inputStyles={styles.inputStyle} />
        </View>
        <View style={{ ...styles.tableCell, flex: 1 }}>
          <Input
            value={requirements?.stepCodePortions?.areaWeightedTotals?.tedi || "-"}
            inputStyles={styles.inputStyle}
          />
        </View>
        <View style={{ ...styles.tableCell, flex: 1 }}>
          <Input value="-" inputStyles={styles.inputStyle} />
        </View>
      </View>
      <View style={styles.tableRow}>
        <View style={{ ...styles.tableCell, flex: 2, textAlign: "left" }}>
          <Text>{t(`${prefix}.performance`)}</Text>
        </View>
        <View style={{ ...styles.tableCell, flex: 1 }}>
          <Input value="-" inputStyles={styles.inputStyle} />
        </View>
        <View style={{ ...styles.tableCell, flex: 1 }}>
          <Input value={adjustedResults?.tedi?.stepCodePortion || "-"} inputStyles={styles.inputStyle} />
        </View>
        <View style={{ ...styles.tableCell, flex: 1 }}>
          <Input value="-" inputStyles={styles.inputStyle} />
        </View>
      </View>
      <View style={styles.tableRow}>
        <View style={{ ...styles.tableCell, flex: 2, textAlign: "left" }}>
          <Text>{t(`${prefix}.compliance`)}</Text>
        </View>
        <View style={{ ...styles.tableCell, flex: 1 }}>
          <Input value="-" inputStyles={styles.inputStyle} />
        </View>
        <View style={{ ...styles.tableCell, flex: 1 }}>
          <Input
            // Note: _disabled prop doesn't exist on the PDF Input component
            // style={ tediComplies ? { backgroundColor: theme.colors.semantic.infoLight } : { backgroundColor: theme.colors.semantic.errorLight } }
            value={tediComplies ? t("ui.yes") : t("ui.no")}
            inputStyles={styles.inputStyle}
          />
        </View>
        <View style={{ ...styles.tableCell, flex: 1 }}>
          <Input value="-" inputStyles={styles.inputStyle} />
        </View>
      </View>
    </View>
  )
}
