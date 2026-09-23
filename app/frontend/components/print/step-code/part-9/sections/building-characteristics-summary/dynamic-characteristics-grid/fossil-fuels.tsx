import React from "react"
import { IPart9StepCodeChecklist } from "../../../../../../../models/part-9-step-code-checklist"
import { EFossilFuelsPresence } from "../../../../../../../types/enums"
import { i18nPrefix } from "../../../../../../domains/step-code/part-9/checklist/building-characteristics-summary/i18n-prefix"
import { reportTranslation as t } from "../../../../../components/report-translation"
import { ReportCell, ReportMetric, ReportRow, ReportText } from "../../../../../components/step-code-layout"
interface IProps {
  checklist: IPart9StepCodeChecklist
}
export function FossilFuels({ checklist }: IProps) {
  const { fossilFuels } = checklist.buildingCharacteristicsSummary
  return (
    <>
      <ReportRow>
        <ReportCell colSpan={4}>
          <ReportText>{t(`${i18nPrefix}.fossilFuels.label`)}</ReportText>
        </ReportCell>
      </ReportRow>

      <ReportRow>
        <ReportCell colSpan={4}>
          <ReportMetric value={t(`${i18nPrefix}.fossilFuels.${fossilFuels.presence as EFossilFuelsPresence}`)} />
        </ReportCell>
      </ReportRow>
      <ReportRow>
        <ReportCell colSpan={4}>
          <ReportMetric value={fossilFuels.details} />
        </ReportCell>
      </ReportRow>
    </>
  )
}
