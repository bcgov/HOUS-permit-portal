import {
  Button,
  Dialog,
  Field,
  Flex,
  Heading,
  NativeSelect,
  Portal,
  Separator,
  Spacer,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react"
import { Trash } from "@phosphor-icons/react"
import React, { useState } from "react"
import { UseFieldArrayReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { IFormIORequirement, IRevisionRequest } from "../../../types/types"
import { singleRequirementFormJson } from "../../../utils/formio-helpers"
import { IRevisionRequestForm } from "../../domains/permit-application/revision-sidebar"
import { SingleRequirementForm } from "../permit-applications/single-requirement-form"

export interface IRevisionModalProps extends Partial<ReturnType<typeof useDisclosure>> {
  requirementJson: IFormIORequirement
  submissionData: any
  revisionRequest: IRevisionRequest
  revisionRequestDefault?: IRevisionRequest
  useFieldArrayMethods: UseFieldArrayReturn<IRevisionRequestForm, "revisionRequestsAttributes", "fieldId">
  onSave: () => Promise<void>
  isRevisionsRequested?: boolean
  disableInput?: boolean
}

export const RevisionModal: React.FC<IRevisionModalProps> = ({
  requirementJson,
  submissionData,
  isOpen,
  onOpen,
  onClose,
  revisionRequest,
  revisionRequestDefault,
  useFieldArrayMethods,
  onSave,
  isRevisionsRequested,
  disableInput,
}) => {
  const { t } = useTranslation()
  const [reasonCode, setReasonCode] = useState<string>(
    revisionRequestDefault?.reasonCode ?? revisionRequest?.reasonCode ?? ""
  )
  const [comment, setComment] = useState<string>(revisionRequestDefault?.comment ?? revisionRequest?.comment ?? "")

  const { update, append, fields } = useFieldArrayMethods

  const { userStore, siteConfigurationStore } = useMst()
  const { currentUser } = userStore
  const { revisionReasonOptions } = siteConfigurationStore

  const className = `formio-component-${requirementJson?.key}`
  const elements = document.getElementsByClassName(className)

  const resetFields = () => {
    setReasonCode("")
    setComment("")
  }

  const handleClose = () => {
    resetFields()
    onClose()
  }
  const index = fields.findIndex((field) => field.id === revisionRequest?.id)

  const handleUpsert = () => {
    if (!reasonCode || !requirementJson) return

    const newItem = {
      id: revisionRequest?.id,
      userId: currentUser.id,
      reasonCode,
      requirementJson,
      submissionData,
      comment,
    }
    if (revisionRequest) {
      // Item exists, replace it
      update(index, newItem)
    } else {
      // Item does not exist, append it
      append(newItem)
    }

    onSave().then(() => {
      elements?.[0]?.classList?.add("revision-requested")
      handleClose()
    })
  }

  const handleDelete = () => {
    if (revisionRequest?.id) {
      update(index, { _destroy: true, id: revisionRequest.id })
    }

    onSave().then(() => {
      elements?.[0]?.classList?.remove("revision-requested")
      handleClose()
    })
  }

  const requirementForm = singleRequirementFormJson(
    revisionRequestDefault?.requirementJson ?? revisionRequest?.requirementJson ?? requirementJson
  )
  const requirementSubmission =
    revisionRequestDefault?.submissionData ?? revisionRequest?.submissionData ?? submissionData

  const selectedLabel = revisionReasonOptions.find((opt) => opt.value === reasonCode)?.label

  return (
    <Dialog.Root
      open={open}
      size="xl"
      onOpenChange={(e) => {
        if (!e.open) {
          handleClose()
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content mt={48}>
            <Dialog.Header textAlign="center">
              <Dialog.CloseTrigger fontSize="11px" />
              <Heading as="h3" fontSize="xl">
                {t("permitApplication.show.revision.revisionRequest")}
              </Heading>
            </Dialog.Header>
            <Dialog.Body>
              <Flex direction="column" gap={4}>
                <Field.Root>
                  <Field.Label>{t("permitApplication.show.revision.reasonFor")}</Field.Label>
                  {isRevisionsRequested ? (
                    <Textarea disabled={true}>{selectedLabel}</Textarea>
                  ) : (
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        placeholder={t("ui.pleaseSelect")}
                        value={reasonCode}
                        onValueChange={(e) => setReasonCode(e.target.value)}
                        disabled={disableInput}
                      >
                        {revisionReasonOptions.map((opt) => (
                          <option value={opt.value} key={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  )}
                </Field.Root>
                <Field.Root>
                  <Field.Label>{t("permitApplication.show.revision.comment")}</Field.Label>
                  <Textarea
                    value={comment}
                    onValueChange={(e) => setComment(e.target.value)}
                    placeholder={t("permitApplication.show.revision.comment")}
                    maxLength={350}
                    disabled={disableInput}
                    css={{
                      "& _disabled": {
                        color: "text.primary",
                        cursor: "not-allowed",
                      },
                    }}
                  />
                  {!disableInput && (
                    <Field.HelperText>{t("permitApplication.show.revision.maxCharacters")}</Field.HelperText>
                  )}
                </Field.Root>

                <Separator />

                <SingleRequirementForm requirementJson={requirementForm} submissionData={requirementSubmission} />
              </Flex>
              <Dialog.Footer>
                <Flex width="full" justify="center" gap={4}>
                  {disableInput ? (
                    <>
                      <Button variant="secondary" onClick={onClose}>
                        {t("ui.ok")}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={handleUpsert} variant="primary" disabled={!reasonCode || isRevisionsRequested}>
                        {t("permitApplication.show.revision.useButton")}
                      </Button>

                      <Button variant="secondary" onClick={onClose}>
                        {t("ui.cancel")}
                      </Button>
                      <Spacer />
                      {revisionRequest && (
                        <Button
                          color="semantic.error"
                          variant="plain"
                          onClick={handleDelete}
                          disabled={isRevisionsRequested}
                        >
                          <Trash />
                          {t("ui.delete")}
                        </Button>
                      )}
                    </>
                  )}
                </Flex>
              </Dialog.Footer>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
