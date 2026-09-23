import { format } from "date-fns"
import React from "react"
import { datefnsAppDateFormat } from "../../../../../../constants"
import { IPart9StepCodeChecklist } from "../../../../../../models/part-9-step-code-checklist"
import { i18nPrefix } from "../../../../../domains/step-code/part-9/checklist/completed-by/i18n-prefix"
import { reportTranslation as t } from "../../../../components/report-translation"
import {
  ReportBoolean,
  ReportMetric,
  ReportPanel,
  ReportRow,
  ReportStack,
  ReportText,
  ReportValue,
} from "../../../../components/step-code-layout"
interface IProps {
  checklist: IPart9StepCodeChecklist
}
export const CompletedBy = function StepCodeChecklistPDFCompletedBy({ checklist }: IProps) {
  return (
    <ReportPanel heading={t(`${i18nPrefix}.heading`)}>
      <ReportText>{t(`${i18nPrefix}.description`)}</ReportText>
      {/* Energy Advisor */}
      <ReportStack>
        <ReportText className="report-strong">{t(`${i18nPrefix}.energyAdvisor`)}</ReportText>
        <ReportRow>
          <ReportMetric label={t(`${i18nPrefix}.name`)} value={checklist.completedBy} />
          <ReportMetric label={t(`${i18nPrefix}.company`)} value={checklist.completedByCompany} />
        </ReportRow>

        <ReportRow>
          <ReportMetric label={t(`${i18nPrefix}.email`)} value={checklist.completedByEmail} />
          <ReportMetric label={t(`${i18nPrefix}.phone`)} value={checklist.completedByPhone} />
        </ReportRow>

        <ReportMetric label={t(`${i18nPrefix}.address`)} value={checklist.completedByAddress} />

        <ReportRow>
          <ReportMetric label={t(`${i18nPrefix}.organization`)} value={checklist.completedByServiceOrganization} />
          <ReportMetric label={t(`${i18nPrefix}.energyAdvisorId`)} value={checklist.energyAdvisorId} />
        </ReportRow>
      </ReportStack>

      <ReportStack>
        <ReportText>{t(`${i18nPrefix}.date`)}</ReportText>
        <ReportValue value={checklist.completedAt ? format(checklist.completedAt, datefnsAppDateFormat) : ""} />
      </ReportStack>

      <ReportRow>
        <ReportBoolean isChecked={checklist.codeco} />
        <ReportText>{t(`${i18nPrefix}.codeco`)}</ReportText>
      </ReportRow>

      <ReportMetric label={t(`${i18nPrefix}.pFile`)} value={checklist.pFileNo} />
    </ReportPanel>
  )
}
