import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, useFormContext } from "react-hook-form"
import { IStepCodeChecklist } from "../../../../../models/step-code-checklist"
import { TextFormControl } from "../../../../shared/form/input-form-control"
import { ChecklistSection } from "../shared/checklist-section"
import { BuildingTypeSelect } from "./building-type-select"
import { translationPrefix } from "./translation-prefix"

interface IProps {
  checklist: IStepCodeChecklist
}

export const ProjectInfo = observer(function ProjectInfo({ checklist }: IProps) {
  const { control } = useFormContext()

  return (
    <ChecklistSection heading={t(`${translationPrefix}.heading`)}>
      <TextFormControl
        label={t(`${translationPrefix}.permitNum`)}
        inputProps={{ isDisabled: true, value: checklist.buildingPermitNumber || "" }}
      />
      {/* TODO: builder - can we get this from the permit application? */}
      <TextFormControl
        label={t(`${translationPrefix}.builder`)}
        inputProps={{ isDisabled: true, value: checklist.builder || "" }}
      />
      <TextFormControl
        label={t(`${translationPrefix}.address`)}
        inputProps={{ isDisabled: true, value: checklist.address || "" }}
      />
      {/* TODO: postal code - is this needed or is included in address above? */}
      <TextFormControl label={t(`${translationPrefix}.postalCode`)} inputProps={{ isDisabled: true }} />
      <TextFormControl
        label={t(`${translationPrefix}.jurisdiction`)}
        inputProps={{ isDisabled: true, value: checklist.jurisdictionName }}
      />
      <TextFormControl
        label={t(`${translationPrefix}.pid`)}
        inputProps={{ isDisabled: true, value: checklist.pid || "" }}
      />
      <Controller
        control={control}
        name="buildingType"
        render={({ field: { onChange, value } }) => <BuildingTypeSelect onChange={onChange} value={value} />}
      />

      <TextFormControl
        label={t(`${translationPrefix}.dwellingUnits`)}
        inputProps={{ isDisabled: true, value: checklist.dwellingUnitsCount || "-" }}
      />
    </ChecklistSection>
  )
})
