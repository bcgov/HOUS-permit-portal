import { Text, View } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IPart3StepCodeChecklist } from "../../../../../../../models/part-3-step-code-checklist"
import { IBaselineOccupancy, IStepCodeOccupancy } from "../../../../../../../types/types"
import { Input } from "../../../../part-9/checklist/pdf-content/shared/field"
import { styles } from "./styles"

interface IProps {
  checklist: IPart3StepCodeChecklist
  prefix: string
}

export const StepCodeOccupanciesPdf = ({ checklist, prefix }: IProps) => (
  <View style={styles.table}>
    <View style={styles.tableRow}>
      <View style={{ ...styles.tableCell, ...styles.tableHeaderCell, flex: 3 }}>
        <Text>{t(`${prefix}.occupancy`)}</Text>
      </View>
      <View style={{ ...styles.tableCell, ...styles.tableHeaderCell, flex: 2 }}>
        <Text>{t(`${prefix}.energy`)}</Text>
      </View>
      <View style={{ ...styles.tableCell, ...styles.tableHeaderCell, flex: 2 }}>
        <Text>{t(`${prefix}.ghgi`)}</Text>
      </View>
    </View>
    {checklist.stepCodeOccupancies.map((oc: IStepCodeOccupancy) => (
      <View key={oc.id} style={styles.tableRow}>
        <View style={{ ...styles.tableCell, flex: 3 }}>
          <Input
            isDisabled
            value={t(`stepCode.part3.stepCodeOccupancyKeys.${oc.key}`)}
            inputStyles={styles.inputStyle}
          />
        </View>
        <View style={{ ...styles.tableCell, flex: 2 }}>
          <Input
            isDisabled
            value={t(`stepCodeChecklist.edit.codeComplianceSummary.energyStepCode.steps.${oc.energyStepRequired}`)}
            inputStyles={styles.inputStyle}
          />
        </View>
        <View style={{ ...styles.tableCell, flex: 2 }}>
          <Input
            isDisabled
            value={t(
              `stepCodeChecklist.edit.codeComplianceSummary.zeroCarbonStepCode.steps.${oc.zeroCarbonStepRequired}`
            )}
            inputStyles={styles.inputStyle}
          />
        </View>
      </View>
    ))}
    {checklist.baselineOccupancies.map((oc: IBaselineOccupancy) => (
      <View key={oc.id} style={styles.tableRow}>
        <View style={{ ...styles.tableCell, flex: 3 }}>
          <Input
            isDisabled
            value={t(`stepCode.part3.baselineOccupancyKeys.${oc.key}`)}
            inputStyles={styles.inputStyle}
          />
        </View>
        <View style={{ ...styles.tableCell, flex: 2 }}>
          <Input
            isDisabled
            value={t(`stepCode.part3.performanceRequirements.${oc.performanceRequirement}`)}
            inputStyles={styles.inputStyle}
          />
        </View>
        <View style={{ ...styles.tableCell, flex: 2 }}>
          <Input isDisabled value="-" inputStyles={styles.inputStyle} />
        </View>
      </View>
    ))}
  </View>
)
