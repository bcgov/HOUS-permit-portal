import { Checkbox, FormControl, FormLabel, HStack, Text, VStack } from "@chakra-ui/react"
import { Envelope, MapPin, Phone } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, useFormContext } from "react-hook-form"
import { IStepCodeChecklist } from "../../../../../models/step-code-checklist"
import { DatePicker } from "../../../../shared/date-picker"
import { TextFormControl } from "../../../../shared/form/input-form-control"
import { ChecklistSection } from "../shared/checklist-section"

interface IProps {
  checklist: IStepCodeChecklist
}

export const CompletedBy = observer(function CompletedBy({ checklist }: IProps) {
  const translationPrefix = "stepCodeChecklist.edit.completedBy"
  const { control } = useFormContext()

  return (
    <ChecklistSection heading={t(`${translationPrefix}.heading`)}>
      <Text fontSize="md">{t(`${translationPrefix}.description`)}</Text>
      <VStack borderWidth={1} p={4} rounded="sm" borderColor="border.light" align="start" w="full">
        <Text fontWeight="bold">{t(`${translationPrefix}.energyAdvisor`)}</Text>
        <HStack w="full">
          <TextFormControl label={t(`${translationPrefix}.name`)} fieldName="completedBy" />
          <TextFormControl label={t(`${translationPrefix}.company`)} fieldName="completedByCompany" />
        </HStack>

        <HStack w="full">
          <TextFormControl
            leftElement={<Envelope />}
            label={t(`${translationPrefix}.email`)}
            fieldName="completedByEmail"
          />
          <TextFormControl
            leftElement={<Phone />}
            label={t(`${translationPrefix}.phone`)}
            fieldName="completedByPhone"
          />
        </HStack>

        {/* TODO: Address picker */}
        <TextFormControl
          leftElement={<MapPin />}
          label={t(`${translationPrefix}.address`)}
          fieldName="completedByAddress"
        />

        <HStack w="full">
          <TextFormControl label={t(`${translationPrefix}.organization`)} fieldName="completedByServiceOrganization" />
          <TextFormControl label={t(`${translationPrefix}.energyAdvisorId`)} fieldName="energyAdvisorId" />
        </HStack>
      </VStack>

      <FormControl>
        <FormLabel>{t(`${translationPrefix}.date`)}</FormLabel>
        <Controller
          control={control}
          name="completedAt"
          render={({ field: { onChange, value } }) => {
            return <DatePicker selected={value} onChange={onChange} />
          }}
        />
      </FormControl>

      <FormControl>
        <Controller
          control={control}
          name="codeco"
          render={({ field: { onChange, value } }) => {
            return (
              <Checkbox isChecked={value} onChange={onChange}>
                {t(`${translationPrefix}.codeco`)}
              </Checkbox>
            )
          }}
        />
      </FormControl>

      <TextFormControl
        label={t(`${translationPrefix}.pFile`)}
        inputProps={{ isDisabled: true, value: checklist.pFileNo }}
      />
    </ChecklistSection>
  )
})
