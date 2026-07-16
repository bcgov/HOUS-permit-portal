import {
  Button,
  ButtonProps,
  HStack,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { v4 as uuidv4 } from "uuid"
import { useAutoComplianceModuleConfigurations } from "../../../../hooks/resources/use-auto-compliance-module-configurations"
import { useMst } from "../../../../setup/root"
import { IRequirementAttributes, IRequirementQuestionParams } from "../../../../types/api-request"
import { EFlashMessageStatus } from "../../../../types/enums"
import { FormModal } from "../../../shared/form-modal"
import { FieldSetup } from "./field-setup"
import { FormSetup } from "./form-setup"

export interface IRequirementQuestionForm {
  id: string
  name?: string
  description?: string
  associationList?: string[]
  // Nested so field Options modals can reuse requirementsAttributes.${index} paths.
  requirementsAttributes: Array<Partial<IRequirementAttributes>>
}

export const QuestionBankModal = observer(function QuestionBankModal({
  triggerButtonProps,
}: {
  triggerButtonProps?: Partial<ButtonProps>
}) {
  const { requirementQuestionStore, uiStore } = useMst()
  const { t } = useTranslation()
  const { createRequirementQuestion } = requirementQuestionStore
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Warm the auto-compliance config cache for the Options → Automated compliance modal.
  useAutoComplianceModuleConfigurations()

  const getDefaultValues = (): IRequirementQuestionForm => ({
    id: crypto.randomUUID?.() ?? uuidv4(),
    associationList: [],
    requirementsAttributes: [],
  })

  const formProps = useForm<IRequirementQuestionForm>({
    defaultValues: getDefaultValues(),
  })
  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = formProps

  const handleOpen = () => {
    reset(getDefaultValues())
    onOpen()
  }

  const onSubmit = async (data: IRequirementQuestionForm) => {
    const field = data.requirementsAttributes[0]
    if (!data.name?.trim() || !field?.label?.trim() || !field?.inputType) {
      uiStore.flashMessage.show(EFlashMessageStatus.error, null, t("questionBank.modals.create.incomplete"))
      return
    }

    const params: IRequirementQuestionParams = {
      id: data.id,
      name: data.name.trim(),
      description: data.description,
      associationList: data.associationList,
      label: field.label,
      inputType: field.inputType,
      hint: field.hint,
      instructions: field.instructions,
      inputOptions: field.inputOptions,
    }

    const isSuccess = await createRequirementQuestion(params)
    if (isSuccess) {
      onClose()
    }
  }

  return (
    <>
      <Button variant={"primary"} onClick={handleOpen} {...triggerButtonProps}>
        {t("questionBank.modals.create.triggerButton")}
      </Button>

      {isOpen && (
        <FormModal
          onClose={onClose}
          isOpen
          formProps={formProps}
          confirmCloseTitle={t("questionBank.modals.unsavedChanges.title")}
          confirmCloseBody={t("questionBank.modals.unsavedChanges.body")}
          confirmCloseButtonText={t("ui.confirm")}
        >
          {({ onClose: closeFormModal }) => (
            <>
              <ModalCloseButton fontSize={"11px"} />
              <ModalHeader display={"flex"} justifyContent={"space-between"} pt={4} px={"2.75rem"} pb={0}>
                <Text as={"h2"} fontSize={"2xl"}>
                  {t("questionBank.modals.create.title")}
                </Text>
                <HStack>
                  <Button
                    variant={"primary"}
                    isLoading={isSubmitting}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSubmit(onSubmit)()
                    }}
                  >
                    {t("ui.onlySave")}
                  </Button>
                  <Button variant={"secondary"} onClick={closeFormModal} isDisabled={isSubmitting}>
                    {t("ui.cancel")}
                  </Button>
                </HStack>
              </ModalHeader>
              <ModalBody px={"2.75rem"}>
                <HStack spacing={9} w={"full"} h={"full"} alignItems={"flex-start"}>
                  <FormSetup />
                  <FieldSetup />
                </HStack>
              </ModalBody>
            </>
          )}
        </FormModal>
      )}
    </>
  )
})
