import { Text, View } from "@react-pdf/renderer"
import { t } from "i18next"
import * as R from "ramda"
import React from "react"
import { IPart3StepCodeChecklist } from "../../../../../../../models/part-3-step-code-checklist"
import { Panel } from "../../../../part-9/checklist/pdf-content/shared/panel"
import { BaselineWholeBuildingPdf } from "./baseline-whole-building"
import { i18nPrefix } from "./i18n-prefix"
import { StepCodeOccupanciesPdf } from "./step-code-occupancies"
import { StepCodePortionsPdf } from "./step-code-portions"
import { StepCodeWholeBuildingPdf } from "./step-code-whole-building"
import { styles } from "./styles"

interface IProps {
  checklist: IPart3StepCodeChecklist
}

export const MixedUseSummary = function StepCodePart3ChecklistPDFMixedUseSummary({ checklist }: IProps) {
  const compliance = checklist.complianceReport?.performance?.complianceSummary
  const requirements = checklist.complianceReport?.performance?.requirements
  const adjustedResults = checklist.complianceReport?.performance?.adjustedResults

  if (!compliance || !requirements || !adjustedResults) {
    // Handle cases where compliance data might not be fully loaded/available
    return (
      <Panel heading={t(`${i18nPrefix}.heading`)} break>
        <Text>Compliance data not available.</Text>
      </Panel>
    )
  }

  const isBaseline = checklist.isBaseline

  return (
    <Panel heading={t(`${i18nPrefix}.heading`)} break>
      {/* Whole Building Performance Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.title}>{t("stepCode.part3.stepCodeSummary.mixedUse.wholeBuilding.title")}</Text>z
        {isBaseline ? (
          <BaselineWholeBuildingPdf
            requirements={requirements}
            compliance={compliance}
            adjustedResults={adjustedResults}
          />
        ) : (
          <StepCodeWholeBuildingPdf
            requirements={requirements}
            adjustedResults={adjustedResults}
            complianceSummary={compliance}
          />
        )}
      </View>

      {/* Step Code Portions Performance Section (Conditional) */}
      {!R.isEmpty(checklist.stepCodeOccupancies) && (
        <View style={styles.sectionContainer}>
          <Text style={styles.title}>{t("stepCode.part3.stepCodeSummary.mixedUse.stepCode.title")}</Text>
          <StepCodePortionsPdf requirements={requirements} adjustedResults={adjustedResults} compliance={compliance} />
        </View>
      )}

      {/* Step Code Occupancies Performance Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.title}>{t("stepCode.part3.stepCodeSummary.mixedUse.occupancies.title")}</Text>
        <StepCodeOccupanciesPdf checklist={checklist} />
      </View>
    </Panel>
  )
}
