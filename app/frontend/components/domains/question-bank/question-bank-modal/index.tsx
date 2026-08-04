import {
  Alert,
  AlertIcon,
  Button,
  ButtonProps,
  HStack,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  Tag,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react"
import { Archive } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { v4 as uuidv4 } from "uuid"
import { IRequirementQuestion } from "../../../../models/requirement-question"
import { useMst } from "../../../../setup/root"
import { IRequirementAttributes, IRequirementQuestionParams } from "../../../../types/api-request"
import { EFlashMessageStatus } from "../../../../types/enums"
import { toBankDefinitionInputOptions } from "../../../../utils/utility-functions"
import { ConfirmationModal } from "../../../shared/confirmation-modal"
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
  requirementQuestion,
  triggerButtonProps,
  triggerButtonLabel,
  autoOpen,
  onSaved,
}: {
  requirementQuestion?: IRequirementQuestion
  triggerButtonProps?: Partial<ButtonProps>
  triggerButtonLabel?: string
  autoOpen?: boolean
  onSaved?: (question: IRequirementQuestion) => void
}) {
  const { requirementQuestionStore, uiStore } = useMst()
  const { t } = useTranslation()
  const { createRequirementQuestion } = requirementQuestionStore
  const { isOpen, onOpen, onClose } = useDisclosure()
  const hasAutoOpenedRef = React.useRef(false)
  const isEditing = !!requirementQuestion
  const isLinked = (requirementQuestion?.requirementBlocks?.length ?? 0) > 0

  const getDefaultValues = (): IRequirementQuestionForm => {
    if (requirementQuestion) {
      return {
        id: requirementQuestion.id,
        name: requirementQuestion.name ?? undefined,
        description: requirementQuestion.description ?? undefined,
        associationList: [...requirementQuestion.associations],
        requirementsAttributes: [
          {
            id: requirementQuestion.id,
            label: requirementQuestion.label,
            inputType: requirementQuestion.inputType,
            hint: requirementQuestion.hint ?? undefined,
            instructions: requirementQuestion.instructions ?? undefined,
            inputOptions: requirementQuestion.inputOptions ?? {},
            requirementCode: requirementQuestion.requirementCode,
            required: true,
          },
        ],
      }
    }

    return {
      id: uuidv4(),
      associationList: [],
      requirementsAttributes: [],
    }
  }

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

  useEffect(() => {
    if (!autoOpen) {
      hasAutoOpenedRef.current = false
      return
    }

    if (!hasAutoOpenedRef.current) {
      hasAutoOpenedRef.current = true
      handleOpen()
    }
  }, [autoOpen])

  // When the user edits a block/template in another tab, refresh usage on return.
  useEffect(() => {
    if (!isOpen || !requirementQuestion) return

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requirementQuestion.refresh()
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => document.removeEventListener("visibilitychange", onVisibilityChange)
  }, [isOpen, requirementQuestion])

  const onSubmit = async (data: IRequirementQuestionForm) => {
    const field = data.requirementsAttributes[0]
    if (!data.name?.trim() || !field?.label?.trim() || !field?.inputType) {
      uiStore.flashMessage.show(EFlashMessageStatus.error, null, t("questionBank.modals.create.incomplete"))
      return false
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
      inputOptions: toBankDefinitionInputOptions(field.inputOptions as Record<string, unknown> | undefined),
    }

    const isSuccess = requirementQuestion
      ? await requirementQuestion.update(params)
      : await createRequirementQuestion(params)

    if (isSuccess) {
      const saved = requirementQuestionStore.getRequirementQuestionById(params.id)
      if (saved) onSaved?.(saved)
      onClose()
    }
    return isSuccess
  }

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleSubmit(onSubmit)()
  }

  return (
    <>
      <Button
        variant={isEditing ? "link" : "primary"}
        textDecoration={isEditing ? "underline" : undefined}
        onClick={handleOpen}
        {...triggerButtonProps}
      >
        {isEditing ? t("ui.edit") : (triggerButtonLabel ?? t("questionBank.modals.create.triggerButton"))}
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
              {requirementQuestion?.isDiscarded && (
                <Tag
                  borderRadius="sm"
                  border="1px solid"
                  borderColor={"semantic.error"}
                  backgroundColor={"semantic.errorLight"}
                  w={"fit-content"}
                  py={1}
                  px={2}
                  color={"semantic.error"}
                  ml={"2.75rem"}
                  mb={2}
                >
                  <HStack>
                    <Archive />
                    <Text textTransform={"capitalize"} fontSize={"sm"}>
                      {t("questionBank.modals.archived")}
                    </Text>
                  </HStack>
                </Tag>
              )}
              <ModalHeader display={"flex"} justifyContent={"space-between"} pt={4} px={"2.75rem"} pb={0}>
                <Text as={"h2"} fontSize={"2xl"}>
                  {t(`questionBank.modals.${isEditing ? "edit" : "create"}.title`)}
                </Text>
                <HStack>
                  {isLinked ? (
                    <ConfirmationModal
                      title={t("questionBank.modals.propagationConfirm.title")}
                      body={t("questionBank.modals.propagationConfirm.body")}
                      onConfirm={async (closeConfirm) => {
                        await handleSubmit(onSubmit)()
                        closeConfirm()
                      }}
                      renderTriggerButton={(props) => (
                        <Button variant={"primary"} isLoading={isSubmitting} {...props}>
                          {t("ui.onlySave")}
                        </Button>
                      )}
                      renderConfirmationButton={(props) => (
                        <Button variant={"primary"} isLoading={isSubmitting} {...props}>
                          {t("ui.onlySave")}
                        </Button>
                      )}
                      modalProps={{ size: "md" }}
                    />
                  ) : (
                    <Button variant={"primary"} isLoading={isSubmitting} onClick={handleSaveClick}>
                      {t("ui.onlySave")}
                    </Button>
                  )}
                  <Button variant={"secondary"} onClick={closeFormModal} isDisabled={isSubmitting}>
                    {t("ui.cancel")}
                  </Button>
                </HStack>
              </ModalHeader>
              <ModalBody px={"2.75rem"} pb={4}>
                <VStack spacing={6} w={"full"} alignItems={"flex-start"}>
                  {isLinked && (
                    <Alert
                      status="warning"
                      borderRadius="lg"
                      borderWidth={1}
                      borderColor="semantic.warning"
                      bg="semantic.warningLight"
                      color="text.primary"
                    >
                      <AlertIcon />
                      <Text>{t("questionBank.modals.propagationWarning")}</Text>
                    </Alert>
                  )}
                  <HStack spacing={9} w={"full"} h={"full"} alignItems={"flex-start"}>
                    <FormSetup requirementQuestion={requirementQuestion} />
                    <FieldSetup requirementBlocks={requirementQuestion?.requirementBlocks} isPersisted={isEditing} />
                  </HStack>
                </VStack>
              </ModalBody>
            </>
          )}
        </FormModal>
      )}
    </>
  )
})
