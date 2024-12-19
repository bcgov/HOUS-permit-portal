import { t } from "i18next"
import React from "react"
import { IPart3StepCodeChecklist } from "../../../../../../../models/part-3-step-code-checklist"
import { Field } from "../../../../step-generic/pdf-content/shared/field"
import { HStack } from "../../../../step-generic/pdf-content/shared/h-stack"
import { Panel } from "../../../../step-generic/pdf-content/shared/panel"
import { i18nPrefix } from "../../project-info/i18n-prefix"

interface IProps {
  checklist: IPart3StepCodeChecklist
}
export const ProjectInfo = ({ checklist }: IProps) => {
  const i18nPrefixDetails = `${i18nPrefix}.projectDetails`
  const i18nlocationDetails = `${i18nPrefix}.locationDetails`
  return (
    <>
      <Panel heading={t(`${i18nPrefixDetails}.heading`)}>
        <Field label={t(`${i18nPrefixDetails}.name`)} value={checklist.projectName} />
        <Field label={t(`${i18nPrefixDetails}.address`)} value={checklist.projectAddress} />
        <Field label={t(`${i18nPrefixDetails}.jurisdiction`)} value={checklist.jurisdictionName} />
        <HStack>
          <Field label={t(`${i18nPrefixDetails}.identifier`)} value={checklist.projectIdentifier} />
          <Field
            label={t(`${i18nPrefixDetails}.stage`)}
            value={t(`${i18nPrefixDetails}.stages.${checklist.projectStage}`)}
          />
        </HStack>
        <Field label={t(`${i18nPrefixDetails}.date`)} value={checklist.permitDate} />
        <Field label={t(`${i18nPrefixDetails}.version`)} value={checklist.buildingCodeVersion} />
      </Panel>
      <Panel heading={t(`${i18nlocationDetails}.heading`)}>
        <Field label={t(`${i18nlocationDetails}.aboveGradeStories.label`)} value={checklist.buildingHeight} />
        <Field label={t(`${i18nlocationDetails}.hdd.label`)} value={checklist.heatingDegreeDays} />
        <Field
          label={t(`${i18nlocationDetails}.climateZone.label`)}
          value={t(`${i18nlocationDetails}.climateZones.${checklist.climateZone}`)}
        />
      </Panel>
    </>
  )
}
