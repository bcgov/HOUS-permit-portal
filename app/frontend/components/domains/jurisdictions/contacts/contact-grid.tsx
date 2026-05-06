import { Flex, IconButton, SimpleGrid } from "@chakra-ui/react"
import { Plus, X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { EFlashMessageStatus } from "../../../../types/enums"
import { IContact } from "../../../../types/types"
import { CustomMessageBox } from "../../../shared/base/custom-message-box"
import { EmailFormControl } from "../../../shared/form/email-form-control"
import { TextFormControl } from "../../../shared/form/input-form-control"
import { JurisdictionAboutContactCard } from "../../../shared/jurisdiction/jurisdiction-about-contact-card"
import { Can } from "../../../shared/user/can"

interface IContactGridProps {
  isEditing: boolean
}

export const ContactGrid = observer(({ isEditing }: IContactGridProps) => {
  const { t } = useTranslation()
  const { jurisdictionStore } = useMst()
  const { currentJurisdiction } = jurisdictionStore

  const { control } = useFormContext()

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contactsAttributes",
  }) as {
    fields: IContact[]
    remove: (index: number) => void
    append: (IContact) => void
  }

  const defaultContactValues = {
    firstName: "",
    lastName: "",
    title: "",
    department: "",
    email: "",
    phone: "",
    extension: "",
    editing: true,
  }

  const handleClickAdd = () => {
    append(defaultContactValues)
  }

  const hasNoContacts = fields.length === 0

  if (!isEditing && hasNoContacts) {
    return (
      <CustomMessageBox
        status={EFlashMessageStatus.info}
        description={t("jurisdiction.edit.contactsEmptyState")}
        px={6}
        py={4}
      />
    )
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4} w="full">
      {fields.map((contact, index) =>
        isEditing ? (
          <ContactFields key={contact.id} index={index} remove={remove} />
        ) : (
          <JurisdictionAboutContactCard key={contact.id} contact={contact} />
        )
      )}
      {isEditing && (
        <Can action="jurisdiction:manage" data={{ jurisdiction: currentJurisdiction }}>
          <IconButton
            minH={500}
            h="full"
            w="full"
            variant="secondary"
            borderColor="border.light"
            aria-label={"add jurisdiction"}
            onClick={handleClickAdd}
          >
            <Plus size={40} />
          </IconButton>
        </Can>
      )}
    </SimpleGrid>
  )
})

interface IContactFieldsProps {
  remove: (number) => void
  index: number
}

export type TContactFieldsValues = {
  name: string
  title: string
  department: string
  email: string
  phone: string
  cell: string
  extension: string
}

const ContactFields = ({ index, remove }: IContactFieldsProps) => {
  const { t } = useTranslation()

  return (
    <Flex direction="column" gap={2} border="1px solid" borderColor="border.light" p={4} bgColor="greys.grey10">
      <Flex justify="flex-end">
        <IconButton variant="tertiary" aria-label={"remove contact"} onClick={() => remove(index)}>
          <X />
        </IconButton>
      </Flex>
      <TextFormControl
        label={t("contact.fields.firstName")}
        fieldName={`contactsAttributes.${index}.firstName`}
        required
      />
      <TextFormControl
        label={t("contact.fields.lastName")}
        fieldName={`contactsAttributes.${index}.lastName`}
        required
      />
      <TextFormControl label={t("contact.fields.title")} fieldName={`contactsAttributes.${index}.title`} required />
      <TextFormControl
        label={t("contact.fields.department")}
        fieldName={`contactsAttributes.${index}.department`}
        required
      />
      <EmailFormControl validate fieldName={`contactsAttributes.${index}.email`} />
      <TextFormControl label={t("contact.fields.phone")} fieldName={`contactsAttributes.${index}.phone`} />
      <TextFormControl label={t("contact.fields.extension")} fieldName={`contactsAttributes.${index}.extension`} />
    </Flex>
  )
}
