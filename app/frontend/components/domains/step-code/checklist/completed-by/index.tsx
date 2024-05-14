import { Button, Checkbox, FormControl, FormLabel, HStack, Text, VStack, useDisclosure } from "@chakra-ui/react"
import { AddressBook, Envelope, MapPin } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, useFormContext } from "react-hook-form"
import { IStepCodeChecklist } from "../../../../../models/step-code-checklist"
import { IContact, IOption } from "../../../../../types/types"
import { ContactModal } from "../../../../shared/contact/contact-modal"
import { DatePicker } from "../../../../shared/date-picker"
import { PhoneFormControl, TextFormControl } from "../../../../shared/form/input-form-control"
import { ChecklistSection } from "../shared/checklist-section"
import { i18nPrefix } from "./i18n-prefix"

interface IProps {
  checklist: IStepCodeChecklist
}

export const CompletedBy = observer(function CompletedBy({ checklist }: IProps) {
  const { control, setValue } = useFormContext()
  const { isOpen: isContactsOpen, onOpen: onContactsOpen, onClose: onContactsClose } = useDisclosure()

  const onContactChange = (option: IOption<IContact>) => {
    const contact = option.value
    setValue("completedBy", `${contact.firstName} ${contact.lastName}`)
    setValue("completedByCompany", contact.businessName)
    setValue("completedByEmail", contact.email)
    setValue("completedByPhone", contact.phone?.slice(2))
    setValue("completedByAddress", contact.address)
    setValue("energyAdvisorId", contact.professionalNumber)
  }

  return (
    <>
      <ChecklistSection heading={t(`${i18nPrefix}.heading`)}>
        <Text fontSize="md">{t(`${i18nPrefix}.description`)}</Text>
        <VStack borderWidth={1} p={4} rounded="sm" borderColor="border.light" align="start" w="full">
          <Text fontWeight="bold">{t(`${i18nPrefix}.energyAdvisor`)}</Text>
          <Button variant="primary" leftIcon={<AddressBook size={20} />} onClick={onContactsOpen}>
            {t("ui.autofill")}
          </Button>
          <HStack w="full">
            <TextFormControl label={t(`${i18nPrefix}.name`)} fieldName="completedBy" />
            <TextFormControl label={t(`${i18nPrefix}.company`)} fieldName="completedByCompany" />
          </HStack>

          <HStack w="full">
            <TextFormControl leftElement={<Envelope />} label={t(`${i18nPrefix}.email`)} fieldName="completedByEmail" />
            <PhoneFormControl label={t(`${i18nPrefix}.phone`)} fieldName="completedByPhone" />
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

      {isContactsOpen && (
        <ContactModal
          isOpen={isContactsOpen}
          onOpen={onContactsOpen}
          onClose={onContactsClose}
          onContactChange={onContactChange}
        />
      )}
    </>
  )
})
