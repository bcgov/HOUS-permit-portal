import { Box, Button, IconButton, PopoverBody, PopoverHeader, SimpleGrid, useDisclosure } from "@chakra-ui/react"
import { X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IPermitCollaboration } from "../../../../models/permit-collaboration"
import { ConfirmationModal } from "../../../shared/confirmation-modal"
import { EmailFormControl } from "../../../shared/form/email-form-control"
import { TextFormControl } from "../../../shared/form/input-form-control"

interface ICollaboratorInviteForm {
  email: string
  firstName: string
  lastName: string
}

export const CollaboratorInvite = observer(function CollaboratorCreate({
  onInvite,
  onClose,
  onInviteSuccess,
  confirmationModalDisclosureProps,
}: {
  onInvite: (user: { email: string; firstName: string; lastName: string }) => Promise<IPermitCollaboration>
  onClose: () => void
  onInviteSuccess: () => void
  confirmationModalDisclosureProps?: ReturnType<typeof useDisclosure>
}) {
  const { t } = useTranslation()
  const formMethods = useForm<ICollaboratorInviteForm>({
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
    },
  })
  const {
    formState: { isValid, isSubmitting },
    handleSubmit,
  } = formMethods

  const onSubmit = handleSubmit(async (values) => {
    const response = await onInvite?.(values)

    confirmationModalDisclosureProps?.onClose?.()

    response && onInviteSuccess()
  })

  return (
    <>
      <PopoverHeader
        fontSize={"lg"}
        fontFamily={"heading"}
        fontWeight={"bold"}
        p={4}
        display="flex"
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        {t("permitCollaboration.popover.collaboratorInvite.title")}
        <IconButton
          size={"xs"}
          onClick={onClose}
          variant={"ghost"}
          aria-label={"close assignment screen"}
          icon={<X />}
          color={"text.primary"}
        />
      </PopoverHeader>
      <PopoverBody px={5} py={4}>
        <FormProvider {...formMethods}>
          <SimpleGrid columns={2} spacing={4}>
            <TextFormControl label={t("contact.fields.firstName")} fieldName={`firstName`} required />
            <TextFormControl label={t("contact.fields.lastName")} fieldName={`lastName`} required />
            <Box gridColumn={"span 2"}>
              <EmailFormControl
                inputProps={{
                  type: "email",
                }}
                label={t("contact.fields.email")}
                fieldName={`email`}
                validate
                required
              />
            </Box>
            <Box gridColumn={"span 2"}>
              <ConfirmationModal
                title={t("permitCollaboration.popover.assignment.inviteWarning.title")}
                body={t("permitCollaboration.popover.assignment.inviteWarning.body")}
                triggerText={t("ui.proceed")}
                renderTriggerButton={({ onClick, ...rest }) => (
                  <Button
                    variant={"primary"}
                    size={"sm"}
                    fontWeight={"semibold"}
                    fontSize={"sm"}
                    onClick={onClick as (e: React.MouseEvent) => Promise<any>}
                    isDisabled={!isValid}
                    isLoading={isSubmitting}
                    {...rest}
                  >
                    {t("permitCollaboration.popover.collaboratorInvite.inviteButton")}
                  </Button>
                )}
                onConfirm={(_onClose) => {
                  onSubmit()
                }}
                modalControlProps={confirmationModalDisclosureProps}
                modalContentProps={{
                  maxW: "700px",
                }}
                confirmButtonProps={{
                  isLoading: isSubmitting,
                  isDisabled: !isValid,
                }}
              />
            </Box>
          </SimpleGrid>
        </FormProvider>
      </PopoverBody>
    </>
  )
})
