import { Text, View } from "@react-pdf/renderer"
import { t } from "i18next"
import * as R from "ramda"
import React from "react"
import { IPart3StepCodeChecklist } from "../../../../../../../models/part-3-step-code-checklist"
import { Field } from "../../../../part-9/checklist/pdf-content/shared/field"
import { Panel } from "../../../../part-9/checklist/pdf-content/shared/panel"
import { BaselineEnergyPdf } from "./baseline-energy"
import { BaselineZeroCarbonPdf } from "./baseline-zero-carbon"
import { i18nPrefix } from "./i18n-prefix"
import { MixedUseEnergyPdf } from "./mixed-use-energy"
import { MixedUseZeroCarbonPdf } from "./mixed-use-zero-carbon"
import { StepCodeEnergyPdf } from "./step-code-energy"
import { StepCodeZeroCarbonPdf } from "./step-code-zero-carbon"
import { styles } from "./styles"

interface IProps {
  checklist: IPart3StepCodeChecklist
}

export const StepCodePerformanceSummary = function StepCodePart3ChecklistPDFStepCodePerformanceSummary({
  checklist,
}: IProps) {
  const isMixedUse = checklist.stepCodeOccupancies.length + checklist.baselineOccupancies.length > 1
  const isBaseline = R.isEmpty(checklist.stepCodeOccupancies)

  let occupancyName: string
  if (!isMixedUse) {
    if (isBaseline) {
      occupancyName = t(`stepCode.part3.baselineOccupancyKeys.${checklist.baselineOccupancies?.[0]?.key}`)
    } else {
      occupancyName = t(`stepCode.part3.stepCodeOccupancyKeys.${checklist.stepCodeOccupancies?.[0]?.key}`)
    }
  }
  return (
    <Panel heading={t(`${i18nPrefix}.heading`)} break>
      <Field
        label={t(`${i18nPrefix}.compliancePath`)}
        value={t(`stepCode.part3.projectDetails.buildingCodeVersions.${checklist.buildingCodeVersion}`)}
      />
      <Field
        label={t(`${i18nPrefix}.stepCodeOccupancy.label`)}
        value={occupancyName || t(`${i18nPrefix}.stepCodeOccupancy.mixedUse`)}
      />

      {/* Performance Details - Mimic HStack */}
      <View style={{ display: "flex", flexDirection: "row", gap: 12, marginTop: 12 }}>
        {/* Energy Column */}
        <View style={styles.column}>
          <Text style={styles.columnHeader}>{t(`${i18nPrefix}.energy.title`)}</Text>
          {isBaseline ? (
            <BaselineEnergyPdf checklist={checklist} />
          ) : isMixedUse ? (
            <MixedUseEnergyPdf />
          ) : (
            <StepCodeEnergyPdf checklist={checklist} />
          )}
        </View>

        {/* Zero Carbon Column */}
        <View style={styles.column}>
          <Text style={styles.columnHeader}>{t(`${i18nPrefix}.zeroCarbon.title`)}</Text>
          {isBaseline ? (
            <BaselineZeroCarbonPdf />
          ) : isMixedUse ? (
            <MixedUseZeroCarbonPdf />
          ) : (
            <StepCodeZeroCarbonPdf checklist={checklist} />
          )}
        </View>
      </View>
    </Panel>
  )
}
