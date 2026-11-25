import React from "react"
import { IPart9StepCodeChecklist } from "../../../../../../../models/part-9-step-code-checklist"
import { i18nPrefix } from "../../../../../../domains/step-code/part-9/checklist/building-characteristics-summary/i18n-prefix"
import { reportTranslation as t } from "../../../../../components/report-translation"
import {
  ReportCell,
  ReportMetric,
  ReportRow,
  ReportStack,
  ReportText,
  ReportValue,
} from "../../../../../components/step-code-layout"
interface IProps {
  checklist: IPart9StepCodeChecklist
}
export function Airtightness({ checklist }: IProps) {
  return (
    <>
      <ReportRow>
        <ReportCell colSpan={4}>
          <ReportText>{t(`${i18nPrefix}.airtightness`)}</ReportText>
        </ReportCell>
      </ReportRow>
      <ReportRow>
        <ReportCell colSpan={2}>
          <ReportValue value={checklist.buildingCharacteristicsSummary.airtightness.details} />
        </ReportCell>
        <ReportCell colSpan={2}>
          <ReportStack>
            <ReportRow>
              <ReportMetric value={t(`${i18nPrefix}.ach`)} />
              <ReportMetric value={checklist.selectedReport?.energy.ach} />
            </ReportRow>
            <ReportRow>
              <ReportMetric value={t(`${i18nPrefix}.nla`)} />
              <ReportMetric value={checklist.selectedReport?.energy.nla} />
            </ReportRow>
            <ReportRow>
              <ReportMetric value={t(`${i18nPrefix}.nlr`)} />
              <ReportMetric value={checklist.selectedReport?.energy.nlr} />
            </ReportRow>
          </ReportStack>
        </ReportCell>
      </ReportRow>
    </>
  )
}
