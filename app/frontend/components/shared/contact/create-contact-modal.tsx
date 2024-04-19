import {
  Button,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react"
import React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { EmailFormControl } from "../form/email-form-control"
import { TextFormControl } from "../form/input-form-control"

export type TCreateContactFormData = {
  firstName: string
  lastName: string
  title: string
  department: string
  email: string
  phone: string
  extension: string
  cell: string
  organization: string
  address: string
  businessName: string
  professionalAssociation: string
  professionalNumber: string
}

type UseDisclosureReturnType = ReturnType<typeof useDisclosure>

export interface IContactModalProps extends Pick<UseDisclosureReturnType, "isOpen" | "onClose"> {
  onCreate: (IContact) => void
}

export const CreateContactModal = ({ isOpen, onClose, onCreate }: IContactModalProps) => {
  const { t } = useTranslation()
  const { contactStore } = useMst()
  const { createContact } = contactStore

  const formMethods = useForm<TCreateContactFormData>({
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      title: "",
      department: "",
      email: "",
      phone: "",
      extension: "",
      cell: "",
      organization: "",
      address: "",
      businessName: "",
      professionalAssociation: "",
      professionalNumber: "",
    },
  })

  const { handleSubmit, formState } = formMethods
  const { isSubmitting, isValid } = formState

  const onSubmit = async (formData) => {
    const newContact = await createContact(formData)
    onCreate(newContact)
    onClose()
  }

  return (
    <Modal onClose={onClose} isOpen={isOpen} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading as="h1" textTransform={"capitalize"}>
            {t("contact.create")}
          </Heading>

          <ModalCloseButton fontSize="11px" />
        </ModalHeader>
        <ModalBody py={6}>
          <FormProvider {...formMethods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Flex direction="column" gap={2} border="1px solid" borderColor="border.light" p={4}>
                <Flex direction={{ base: "column", md: "row" }} gap={2}>
                  <TextFormControl label={t("contact.fields.firstName")} fieldName={`firstName`} required />
                  <TextFormControl label={t("contact.fields.lastName")} fieldName={`lastName`} required />
                </Flex>
                <Flex direction={{ base: "column", md: "row" }} gap={2}>
                  <EmailFormControl validate fieldName={`email`} />
                  <TextFormControl label={t("contact.fields.phone")} fieldName={`phone`} />
                </Flex>
                <TextFormControl label={t("contact.fields.extension")} fieldName={`extension`} />
                <TextFormControl label={t("contact.fields.cell")} fieldName={`cell`} />
                <TextFormControl label={t("contact.fields.title")} fieldName={`title`} />
                <TextFormControl label={t("contact.fields.address")} fieldName={`address`} />

                <Flex direction={{ base: "column", md: "row" }} gap={2}>
                  <TextFormControl label={t("contact.fields.organization")} fieldName={`organization`} />
                  <TextFormControl label={t("contact.fields.department")} fieldName={`department`} />
                </Flex>
                <TextFormControl label={t("contact.fields.businessName")} fieldName={`businessName`} />
                <Flex direction={{ base: "column", md: "row" }} gap={2}>
                  <TextFormControl
                    label={t("contact.fields.professionalAssociation")}
                    fieldName={`professionalAssociation`}
                  />
                  <TextFormControl label={t("contact.fields.professionalNumber")} fieldName={`professionalNumber`} />
                </Flex>
                <Button
                  variant="primary"
                  type="submit"
                  isDisabled={!isValid || isSubmitting}
                  isLoading={isSubmitting}
                  loadingText={t("ui.loading")}
                >
                  {t("contact.createButton")}
                </Button>
              </Flex>
            </form>
          </FormProvider>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
