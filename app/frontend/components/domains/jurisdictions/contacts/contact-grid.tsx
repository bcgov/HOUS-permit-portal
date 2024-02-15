import { Flex, Grid, GridItem, Heading, IconButton, Link } from "@chakra-ui/react"
import { Envelope, Phone, Plus, X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { ReactNode } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { IContact } from "../../../../types/types"
import { EmailFormControl } from "../../../shared/form/email-form-control"
import { TextFormControl } from "../../../shared/form/input-form-control"
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
    name: "",
    title: "",
    department: "",
    email: "",
    phoneNumber: "",
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
          <ContactGridItem key={contact.id}>
            <Heading fontSize="lg">{contact.name}</Heading>
            {contact.department && `${contact.department} - `}
            {contact.title}
            <Flex mt={2} direction={{ base: "column", md: "row" }} gap={2}>
              <Flex flex={1} gap={4}>
                <Phone size={32} />
                <Flex direction="column" flex={1}>
                  <Heading fontSize="md">Telephone</Heading>
                  <Link href={`tel:+${contact.phoneNumber}`}>{contact.phoneNumber}</Link>
                </Flex>
              </Flex>
              <Flex flex={1} gap={4}>
                <Envelope size={32} />
                <Flex direction="column" flex={1}>
                  <Heading fontSize="md">Email</Heading>
                  <Link href={`mailto:${contact.email}`}>{contact.email}</Link>
                </Flex>
              </Flex>
            </Flex>
          </ContactGridItem>
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
  extension: string
}

const ContactFields = ({ index, remove }: IContactFieldsProps) => {
  const { t } = useTranslation()

  return (
    <Flex direction="column" gap={2} border="1px solid" borderColor="border.light" p={4}>
      <Flex justify="flex-end">
        <IconButton variant="tertiary" icon={<X />} aria-label={"remove contact"} onClick={() => remove(index)} />
      </Flex>
      <TextFormControl label={t("contact.fields.name")} fieldName={`contactsAttributes.${index}.name`} required />
      <TextFormControl label={t("contact.fields.title")} fieldName={`contactsAttributes.${index}.title`} required />
      <TextFormControl
        label={t("contact.fields.department")}
        fieldName={`contactsAttributes.${index}.department`}
        required
      />
      <EmailFormControl validate fieldName={`contactsAttributes.${index}.email`} />
      <TextFormControl label={t("contact.fields.phoneNumber")} fieldName={`contactsAttributes.${index}.phoneNumber`} />
      <TextFormControl label={t("contact.fields.extension")} fieldName={`contactsAttributes.${index}.extension`} />
    </Flex>
  )
}

interface IContactBoxProps {
  children: ReactNode
}

const ContactGridItem = ({ children }: IContactBoxProps) => {
  return (
    <GridItem
      as="section"
      colSpan={{ sm: 1, md: 1 }}
      borderRadius="sm"
      border="1px solid"
      borderColor="border.light"
      h="fit-content"
      minH="195px"
      p={4}
    >
      {children}
    </GridItem>
  )
}
