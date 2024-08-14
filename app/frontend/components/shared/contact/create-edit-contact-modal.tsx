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
import { Trash } from "@phosphor-icons/react"
import React, { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { IContact } from "../../../types/types"
import { convertE164PhoneToInputDefault } from "../../../utils/utility-functions"
import { EmailFormControl } from "../form/email-form-control"
import { PhoneFormControl, TextFormControl } from "../form/input-form-control"
import { RemoveConfirmationModal } from "../modals/remove-confirmation-modal"

export type TContactFormData = {
  id: string
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

export interface ICreateEditContactModalProps extends Pick<UseDisclosureReturnType, "isOpen" | "onClose"> {
  contact?: IContact
  onCreateOrUpdate: (contact: TContactFormData) => void
  onDestroy: () => void
}

export const CreateEditContactModal = ({
  isOpen,
  onClose,
  contact,
  onCreateOrUpdate,
  onDestroy,
}: ICreateEditContactModalProps) => {
  const { t } = useTranslation()
  const { contactStore } = useMst()
  const { createContact, updateContact, destroyContact } = contactStore

  const getDefaultValues = () => {
    return {
      firstName: contact?.firstName ?? "",
      lastName: contact?.lastName ?? "",
      title: contact?.title ?? "",
      department: contact?.department ?? "",
      email: contact?.email ?? "",
      phone: convertE164PhoneToInputDefault(contact?.phone) ?? "",
      extension: contact?.extension ?? "",
      cell: convertE164PhoneToInputDefault(contact?.cell) ?? "",
      organization: contact?.organization ?? "",
      address: contact?.address ?? "",
      businessName: contact?.businessName ?? "",
      professionalAssociation: contact?.professionalAssociation ?? "",
      professionalNumber: contact?.professionalNumber ?? "",
    }
  }

  useEffect(() => {
    reset(getDefaultValues())
  }, [contact])

  const formMethods = useForm<TContactFormData>({
    mode: "onChange",
    defaultValues: getDefaultValues(),
  })

  const { handleSubmit, formState, reset } = formMethods
  const { isSubmitting, isValid } = formState

  const onSubmit = async (formData: TContactFormData) => {
    if (contact) {
      await updateContact(contact.id, formData)
    } else {
      await createContact(formData)
    }
    onCreateOrUpdate(formData)
    onClose()
  }

  const handleDelete = () => {
    destroyContact(contact.id)
    onDestroy()
    onClose()
  }

  return (
    <Modal onClose={onClose} isOpen={isOpen} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading as="h1" textTransform={"capitalize"}>
            {contact ? t("contact.edit") : t("contact.create")}
          </Heading>
          <ModalCloseButton fontSize="11px" />
        </ModalHeader>
        <ModalBody py={6}>
          <FormProvider {...formMethods}>
            <Flex direction="column" gap={2} border="1px solid" borderColor="border.light" p={4}>
              <Flex direction={{ base: "column", md: "row" }} gap={2}>
                <TextFormControl label={t("contact.fields.firstName")} fieldName="firstName" required />
                <TextFormControl label={t("contact.fields.lastName")} fieldName="lastName" required />
              </Flex>
              <Flex direction={{ base: "column", md: "row" }} gap={2}>
                <EmailFormControl validate fieldName="email" />
                <PhoneFormControl label={t("contact.fields.phone")} fieldName="phone" />
              </Flex>
              <TextFormControl label={t("contact.fields.extension")} fieldName="extension" />
              <PhoneFormControl label={t("contact.fields.cell")} fieldName="cell" />
              <TextFormControl label={t("contact.fields.title")} fieldName="title" />
              <TextFormControl label={t("contact.fields.address")} fieldName="address" />
              <Flex direction={{ base: "column", md: "row" }} gap={2}>
                <TextFormControl label={t("contact.fields.organization")} fieldName="organization" />
                <TextFormControl label={t("contact.fields.department")} fieldName="department" />
              </Flex>
              <TextFormControl label={t("contact.fields.businessName")} fieldName="businessName" />
              <Flex direction={{ base: "column", md: "row" }} gap={2}>
                <TextFormControl
                  label={t("contact.fields.professionalAssociation")}
                  fieldName="professionalAssociation"
                />
                <TextFormControl label={t("contact.fields.professionalNumber")} fieldName="professionalNumber" />
              </Flex>
              <Flex w="full" justify="space-between">
                <Button
                  variant="primary"
                  onClick={handleSubmit(onSubmit)}
                  isDisabled={!isValid || isSubmitting}
                  isLoading={isSubmitting}
                  loadingText={t("ui.loading")}
                >
                  {contact ? t("contact.updateButton") : t("contact.createButton")}
                </Button>

                <RemoveConfirmationModal
                  title={t("contact.confirmDeleteTitle")}
                  body={t("contact.confirmDeleteBody")}
                  renderTriggerButton={(props) => {
                    return (
                      <Button
                        color="semantic.error"
                        onClick={(e) => {}}
                        leftIcon={<Trash />}
                        variant="link"
                        px={2}
                        {...props}
                      >
                        {t("ui.delete")}
                      </Button>
                    )
                  }}
                  onRemove={handleDelete}
                />
              </Flex>
            </Flex>
          </FormProvider>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
