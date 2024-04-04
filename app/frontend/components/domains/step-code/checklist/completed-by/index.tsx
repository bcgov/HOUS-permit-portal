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
import { i18nPrefix } from "./i18n-prefix"

interface IProps {
  checklist: IStepCodeChecklist
}

export const CompletedBy = observer(function CompletedBy({ checklist }: IProps) {
  const { control } = useFormContext()

  return (
    <ChecklistSection heading={t(`${i18nPrefix}.heading`)}>
      <Text fontSize="md">{t(`${i18nPrefix}.description`)}</Text>
      <VStack borderWidth={1} p={4} rounded="sm" borderColor="border.light" align="start" w="full">
        <Text fontWeight="bold">{t(`${i18nPrefix}.energyAdvisor`)}</Text>
        <HStack w="full">
          <TextFormControl label={t(`${i18nPrefix}.name`)} fieldName="completedBy" />
          <TextFormControl label={t(`${i18nPrefix}.company`)} fieldName="completedByCompany" />
        </HStack>

        <HStack w="full">
          <TextFormControl leftElement={<Envelope />} label={t(`${i18nPrefix}.email`)} fieldName="completedByEmail" />
          <TextFormControl leftElement={<Phone />} label={t(`${i18nPrefix}.phone`)} fieldName="completedByPhone" />
        </HStack>

        {/* TODO: Address picker */}
        <TextFormControl leftElement={<MapPin />} label={t(`${i18nPrefix}.address`)} fieldName="completedByAddress" />

        <HStack w="full">
          <TextFormControl label={t(`${i18nPrefix}.organization`)} fieldName="completedByServiceOrganization" />
          <TextFormControl label={t(`${i18nPrefix}.energyAdvisorId`)} fieldName="energyAdvisorId" />
        </HStack>
      </VStack>

      <FormControl>
        <FormLabel>{t(`${i18nPrefix}.date`)}</FormLabel>
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
                {t(`${i18nPrefix}.codeco`)}
              </Checkbox>
            )
          }}
        />
      </FormControl>

      <TextFormControl label={t(`${i18nPrefix}.pFile`)} inputProps={{ isDisabled: true, value: checklist.pFileNo }} />
    </ChecklistSection>
  )
})
