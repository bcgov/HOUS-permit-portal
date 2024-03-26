import { Flex, FormControl, FormLabel, InputGroup, Text } from "@chakra-ui/react"
import { MapPin } from "@phosphor-icons/react"
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
      <Text fontSize="lg" fontWeight="bold">
        {t(`${translationPrefix}.stages.${checklist.stage}`)}
      </Text>
      <TextFormControl
        label={t(`${translationPrefix}.permitNum`)}
        inputProps={{ isDisabled: true, value: checklist.buildingPermitNumber || "" }}
      />
      <TextFormControl label={t(`${translationPrefix}.builder`)} fieldName="builder" />

      <TextFormControl
        label={t(`${translationPrefix}.address`)}
        inputProps={{ isDisabled: true, value: checklist.address || "" }}
        leftElement={<MapPin size={20} color="var(--chakra-colors-greys-grey01)" />}
      />
      <TextFormControl
        label={t(`${translationPrefix}.jurisdiction`)}
        inputProps={{ isDisabled: true, value: checklist.jurisdictionName }}
      />
      <TextFormControl
        label={t(`${translationPrefix}.pid`)}
        inputProps={{ isDisabled: true, value: checklist.pid || "" }}
      />

      <Flex gap={2} w="full">
        <FormControl flex={1}>
          <FormLabel>{t(`${translationPrefix}.buildingType.label`)}</FormLabel>
          <InputGroup>
            <Controller
              control={control}
              name="buildingType"
              render={({ field: { onChange, value } }) => <BuildingTypeSelect onChange={onChange} value={value} />}
            />
          </InputGroup>
        </FormControl>

        <TextFormControl
          flex={1}
          label={t(`${translationPrefix}.dwellingUnits`)}
          inputProps={{ isDisabled: true, value: checklist.dwellingUnitsCount || "-" }}
        />
      </Flex>
    </ChecklistSection>
  )
})
