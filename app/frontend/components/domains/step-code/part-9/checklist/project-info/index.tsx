import { FormControl, FormLabel, InputGroup } from "@chakra-ui/react"
import { MapPin } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, useFormContext } from "react-hook-form"
import { IJurisdiction } from "../../../../../../models/jurisdiction"
import { IPart9StepCodeChecklist } from "../../../../../../models/part-9-step-code-checklist"
import { IOption } from "../../../../../../types/types"
import { TextFormControl } from "../../../../../shared/form/input-form-control"
import { SitesSelect } from "../../../../../shared/select/selectors/sites-select"
import { ChecklistSection } from "../shared/checklist-section"
import { BuildingTypeSelect } from "./building-type-select"
import { i18nPrefix } from "./i18n-prefix"

interface IProps {
  checklist: IPart9StepCodeChecklist
  isEditable?: boolean
  initialJurisdiction?: IJurisdiction | null
}

export const ProjectInfo = observer(function ProjectInfo({
  checklist,
  isEditable = false,
  initialJurisdiction,
}: IProps) {
  const { control, register, setValue } = useFormContext()

  return (
    <ChecklistSection heading={t(`${i18nPrefix}.heading`)}>
      <TextFormControl label={t(`${i18nPrefix}.permitNum`)} fieldName="referenceNumber" />
      <TextFormControl label={t(`${i18nPrefix}.builder`)} fieldName="builder" />

      {isEditable ? (
        <>
          <Controller
            name="site"
            control={control}
            render={({ field: { onChange, value } }) => (
              <SitesSelect
                onChange={(option: IOption) => {
                  onChange(option)
                  setValue("fullAddress", option?.label || "", { shouldValidate: true })
                }}
                selectedOption={value}
                pidName="pid"
                siteName="site"
                jurisdictionIdFieldName="jurisdictionId"
                jurisdictionRequired
                initialJurisdiction={initialJurisdiction}
                menuPortalTarget={document.body}
              />
            )}
          />
          <input type="hidden" {...register("fullAddress", { required: true })} />
        </>
      ) : (
        <>
          <TextFormControl
            label={t(`${i18nPrefix}.address`)}
            inputProps={{ isDisabled: true, value: checklist.fullAddress || "" }}
            leftElement={<MapPin size={20} color="var(--chakra-colors-greys-grey01)" />}
          />
          <TextFormControl
            label={t(`${i18nPrefix}.jurisdiction`)}
            inputProps={{ isDisabled: true, value: checklist.jurisdictionName }}
          />
          <TextFormControl
            label={t(`${i18nPrefix}.pid`)}
            inputProps={{ isDisabled: true, value: checklist.pid || "" }}
          />
        </>
      )}

      <FormControl>
        <FormLabel>{t(`${i18nPrefix}.buildingType.label`)}</FormLabel>
        <InputGroup>
          <Controller
            control={control}
            name="buildingType"
            render={({ field: { onChange, value } }) => <BuildingTypeSelect onChange={onChange} value={value} />}
          />
        </InputGroup>
      </FormControl>
    </ChecklistSection>
  )
})
