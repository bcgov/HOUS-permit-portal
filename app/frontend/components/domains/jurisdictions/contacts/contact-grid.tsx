import { Flex, Grid, IconButton } from "@chakra-ui/react"
import { Plus, X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { IContact } from "../../../../types/types"
import { EmailFormControl } from "../../../shared/form/email-form-control"
import { TextFormControl } from "../../../shared/form/input-form-control"
import { ContactCard } from "../../../shared/jurisdiction/contact-card"
import { Can } from "../../../shared/user/can"

interface IContactGridProps {
  isEditing: boolean
}

export const ContactGrid = observer(({ isEditing }: IContactGridProps) => {
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

  return (
    <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={4}>
      {fields.map((contact, index) =>
        isEditing ? (
          <ContactFields key={contact.id} index={index} remove={remove} />
        ) : (
          <ContactCard colSpan={{ sm: 1, md: 1 }} key={contact.id} contact={contact} />
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
            icon={<Plus size={40} />}
            aria-label={"add jurisdiction"}
            onClick={handleClickAdd}
          />
        </Can>
      )}
    </Grid>
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
    <Flex direction="column" gap={2} border="1px solid" borderColor="border.light" p={4}>
      <Flex justify="flex-end">
        <IconButton variant="tertiary" icon={<X />} aria-label={"remove contact"} onClick={() => remove(index)} />
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
