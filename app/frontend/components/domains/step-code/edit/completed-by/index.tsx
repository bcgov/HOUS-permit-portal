import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { TextFormControl } from "../../../../shared/form/input-form-control"
import { ChecklistSection } from "../shared/checklist-section"

export const CompletedBy = observer(function CompletedBy() {
  const translationPrefix = "stepCodeChecklist.edit.completedBy"
  return (
    <ChecklistSection heading={t(`${translationPrefix}.heading`)}>
      <TextFormControl label={t(`${translationPrefix}.name`)} fieldName="completedBy" />
      {/* TODO: Datepicker */}
      <TextFormControl label={t(`${translationPrefix}.date`)} fieldName="completedAt" />
      <TextFormControl label={t(`${translationPrefix}.company`)} fieldName="completedByCompany" />
      <TextFormControl label={t(`${translationPrefix}.organization`)} fieldName="completedByServiceOrganization" />
      <TextFormControl label={t(`${translationPrefix}.phone`)} fieldName="completedByPhone" />
      <TextFormControl label={t(`${translationPrefix}.energyAdvisorId`)} fieldName="energyAdvisorId" />
      {/* TODO: Address picker */}
      <TextFormControl label={t(`${translationPrefix}.address`)} fieldName="completedByAddress" />
      <TextFormControl label={t(`${translationPrefix}.email`)} fieldName="completedByEmail" />
      {/* TODO: CODECO & P File No */}
    </ChecklistSection>
  )
})
