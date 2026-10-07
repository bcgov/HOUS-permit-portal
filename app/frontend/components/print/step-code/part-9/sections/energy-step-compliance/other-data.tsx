import React from "react"
import { IStepCodeEnergyComplianceReport } from "../../../../../../models/step-code-energy-compliance-report"
import { i18nPrefix } from "../../../../../domains/step-code/part-9/checklist/energy-step-code-compliance/i18n-prefix"
import { reportTranslation as t } from "../../../../components/report-translation"
import { ReportCell, ReportRow, ReportStack, ReportText } from "../../../../components/step-code-layout"
interface IProps {
  report: IStepCodeEnergyComplianceReport
}
export function OtherData({ report }: IProps) {
  return (
    <ReportStack>
      <ReportRow>
        <ReportCell colSpan={4}>
          <ReportText className="report-strong">{t(`${i18nPrefix}.otherData.header`)}</ReportText>
        </ReportCell>
      </ReportRow>

      <Row label={t(`${i18nPrefix}.otherData.software`)} value={report.softwareName} />
      <Row label={t(`${i18nPrefix}.otherData.softwareVersion`)} value={report.softwareVersion} />
      <Row label={t(`${i18nPrefix}.otherData.heatedFloorArea`)} value={report.totalHeatedFloorArea} />
      <Row label={t(`${i18nPrefix}.otherData.volume`)} value={report.volume} />
      <Row label={t(`${i18nPrefix}.otherData.surfaceArea`)} value={report.surfaceArea} />
      <Row label={t(`${i18nPrefix}.otherData.fwdr`)} value={report.fwdr} />
      <Row label={t(`${i18nPrefix}.otherData.climateLocation`)} value={report.location} />
      <Row label={t(`${i18nPrefix}.otherData.hdd`)} value={report.heatingDegreeDays} />
      <Row label={t(`${i18nPrefix}.otherData.spaceCooled`)} value={report.conditionedPercent} isLast />
    </ReportStack>
  )
}
function Row({ label, value, isLast = false }) {
  return (
    <ReportRow>
      <ReportCell colSpan={2}>
        <ReportText>{label}</ReportText>
      </ReportCell>
      <ReportCell colSpan={2}>
        <ReportText>{value}</ReportText>
      </ReportCell>
    </ReportRow>
  )
}
