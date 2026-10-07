import * as R from "ramda"
import React from "react"
import { IPart9StepCodeChecklist } from "../../../../../../../models/part-9-step-code-checklist"
import { ESpaceHeatingCoolingPerformanceType, ESpaceHeatingCoolingVariant } from "../../../../../../../types/enums"
import { generateUUID } from "../../../../../../../utils/utility-functions"
import { i18nPrefix } from "../../../../../../domains/step-code/part-9/checklist/building-characteristics-summary/i18n-prefix"
import { reportTranslation as t } from "../../../../../components/report-translation"
import { ReportCell, ReportMetric, ReportRow, ReportText } from "../../../../../components/step-code-layout"
interface IProps {
  checklist: IPart9StepCodeChecklist
}
export function SpaceHeatingCooling({ checklist }: IProps) {
  return (
    <>
      <ReportRow>
        <ReportCell colSpan={4}>
          <ReportText>{t(`${i18nPrefix}.spaceHeatingCooling`)}</ReportText>
        </ReportCell>
      </ReportRow>
      <ReportRow>
        <ReportCell colSpan={2}>
          <ReportText className="report-strong">{t(`${i18nPrefix}.principal`)}</ReportText>
        </ReportCell>
        <ReportCell colSpan={1} />
        <ReportCell colSpan={1} />
      </ReportRow>
      <Fields variant={ESpaceHeatingCoolingVariant.principal} checklist={checklist} />
      <ReportRow>
        <ReportCell colSpan={2}>
          <ReportText className="report-strong">{t(`${i18nPrefix}.secondary`)}</ReportText>
        </ReportCell>
        <ReportCell colSpan={1} />
        <ReportCell colSpan={1} />
      </ReportRow>
      <Fields variant={ESpaceHeatingCoolingVariant.secondary} checklist={checklist} />
    </>
  )
}
interface IFieldsProps {
  variant: ESpaceHeatingCoolingVariant
  checklist: IPart9StepCodeChecklist
}
function Fields({ variant, checklist }: IFieldsProps) {
  const variantLines = R.filter(
    (f: any) => f.variant == variant,
    checklist.buildingCharacteristicsSummary.spaceHeatingCoolingLines
  )
  return variantLines.map((line, index) => (
    <ReportRow key={`spaceHeatingCoolingLine.${generateUUID()}`}>
      <ReportCell colSpan={2}>
        <ReportMetric value={line.details} />
      </ReportCell>
      <ReportCell colSpan={1}>
        <ReportMetric value={t(`${i18nPrefix}.${line.performanceType as ESpaceHeatingCoolingPerformanceType}`)} />
      </ReportCell>
      <ReportCell colSpan={1}>
        <ReportMetric value={line.performanceValue} />
      </ReportCell>
    </ReportRow>
  ))
}
