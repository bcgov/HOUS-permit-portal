import {
  Button,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
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
  submissionJson: any
  revisionRequest: IRevisionRequest
  revisionRequestDefault?: IRevisionRequest
  useFieldArrayMethods: UseFieldArrayReturn<IRevisionRequestForm, "revisionRequestsAttributes", "fieldId">
  onSave: () => Promise<void>
  isRevisionsRequested?: boolean
  disableInput?: boolean
}

export const RevisionModal: React.FC<IRevisionModalProps> = ({
  requirementJson,
  submissionJson,
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
      submissionJson,
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
    revisionRequestDefault?.submissionJson ?? revisionRequest?.submissionJson ?? submissionJson

  const selectedLabel = revisionReasonOptions.find((opt) => opt.value === reasonCode)?.label

  return (
    <Modal onClose={handleClose} isOpen={isOpen} size="lg">
      <ModalOverlay />

      <ModalContent mt={48}>
        <ModalHeader textAlign="center">
          <ModalCloseButton fontSize="11px" />
          <Heading as="h3" fontSize="xl">
            {t("permitApplication.show.revision.revisionRequest")}
          </Heading>
        </ModalHeader>
        <ModalBody>
          <Flex direction="column" gap={4}>
            <FormControl>
              <FormLabel>{t("permitApplication.show.revision.reasonFor")}</FormLabel>
              {isRevisionsRequested ? (
                <Textarea disabled={true}>{selectedLabel}</Textarea>
              ) : (
                <Select
                  placeholder={t("ui.pleaseSelect")}
                  value={reasonCode}
                  onChange={(e) => setReasonCode(e.target.value)}
                >
                  {revisionReasonOptions.map((opt) => (
                    <option value={opt.value} key={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              )}
            </FormControl>
            <FormControl>
              <FormLabel>{t("permitApplication.show.revision.comment")}</FormLabel>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("permitApplication.show.revision.comment")}
                maxLength={350}
                isDisabled={isRevisionsRequested}
                sx={{
                  _disabled: {
                    color: "text.primary",
                    cursor: "not-allowed",
                  },
                }}
              />
              {!disableInput && <FormHelperText>{t("permitApplication.show.revision.maxCharacters")}</FormHelperText>}
            </FormControl>

            <Divider />

            <SingleRequirementForm requirementJson={requirementForm} submissionJson={requirementSubmission} />
          </Flex>
          <ModalFooter>
            <Flex width="full" justify="center" gap={4}>
              {disableInput ? (
                <>
                  <Button variant="secondary" onClick={onClose}>
                    {t("ui.ok")}
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleUpsert} variant="primary" isDisabled={!reasonCode || isRevisionsRequested}>
                    {t("permitApplication.show.revision.useButton")}
                  </Button>

                  <Button variant="secondary" onClick={onClose}>
                    {t("ui.cancel")}
                  </Button>
                  <Spacer />
                  {revisionRequest && (
                    <Button
                      color="semantic.error"
                      leftIcon={<Trash />}
                      variant="link"
                      onClick={handleDelete}
                      isDisabled={isRevisionsRequested}
                    >
                      {t("ui.delete")}
                    </Button>
                  )}
                </>
              )}
            </Flex>
          </ModalFooter>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
