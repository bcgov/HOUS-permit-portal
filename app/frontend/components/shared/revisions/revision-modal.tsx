import {
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Stack,
  Text,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react"
import { Trash } from "@phosphor-icons/react"
import React, { useState } from "react"
import { UseFieldArrayReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { ERevisionRequestType } from "../../../types/enums"
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
      type: revisionRequest?.type || ERevisionRequestType.FieldRevisionRequest,
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
  const fieldLabel = requirementJson?.label || t("permitApplication.show.revision.revisionRequest")
  const readOnly = disableInput || isRevisionsRequested
  const previousValue = (
    <SingleRequirementForm requirementJson={requirementForm} submissionData={requirementSubmission} />
  )

  return (
    <Modal onClose={handleClose} isOpen={isOpen} size="lg">
      <ModalOverlay />

      <ModalContent mt={48}>
        <ModalHeader textAlign="left" px={10} pt={10} pb={4}>
          <ModalCloseButton fontSize="11px" />
          <Heading as="h3" fontSize="2xl" textAlign="left">
            {disableInput ? t("permitApplication.show.revision.submitterRevisionTitle") : fieldLabel}
          </Heading>
          {!readOnly && (
            <Text fontWeight="normal" fontSize="md" mt={2}>
              {t("permitApplication.show.revision.requestRevisionIntro")}
            </Text>
          )}
        </ModalHeader>
        <ModalBody px={10} pt={0} pb={10}>
          <Flex direction="column" gap={4} align="stretch">
            {disableInput && (
              <Flex direction="column" gap={1}>
                <Text fontWeight="bold">{t("permitApplication.show.revision.fieldLabel")}</Text>
                <Text>{fieldLabel}</Text>
              </Flex>
            )}
            <Flex direction="column" gap={2}>
              <Text fontWeight="bold">{t("permitApplication.show.revision.responseProvided")}</Text>
              {previousValue}
            </Flex>
            {readOnly ? (
              <>
                <Flex direction="column" gap={1}>
                  <Text fontWeight="bold">{t("permitApplication.show.revision.whyRevisionNeeded")}</Text>
                  <Text>{selectedLabel || t("permitApplication.show.revision.notProvided")}</Text>
                </Flex>
                <Flex direction="column" gap={1}>
                  <Text fontWeight="bold">{t("permitApplication.show.revision.explanationFromAuthority")}</Text>
                  <Text>{comment || t("permitApplication.show.revision.notProvided")}</Text>
                </Flex>
                <Flex justify="flex-start">
                  <Button variant="secondary" onClick={onClose}>
                    {t("ui.close")}
                  </Button>
                </Flex>
              </>
            ) : (
              <>
                <FormControl>
                  <FormLabel>{t("permitApplication.show.revision.whyRevisionNeeded")}</FormLabel>
                  <RadioGroup value={reasonCode} onChange={setReasonCode}>
                    <Stack spacing={4}>
                      {revisionReasonOptions.map((opt) => (
                        <Radio key={opt.value} value={opt.value}>
                          {opt.label}
                        </Radio>
                      ))}
                    </Stack>
                  </RadioGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>{t("permitApplication.show.revision.explanationToApplicant")}</FormLabel>
                  <Textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={350} />
                  <FormHelperText>{t("permitApplication.show.revision.explanationToApplicantHelper")}</FormHelperText>
                </FormControl>
                <Flex justify="flex-start" gap={4}>
                  <Button onClick={handleUpsert} variant="primary" isDisabled={!reasonCode}>
                    {revisionRequest ? t("ui.change") : t("ui.add")}
                  </Button>
                  <Button variant="secondary" onClick={onClose}>
                    {t("ui.cancel")}
                  </Button>
                </Flex>
                {revisionRequest && (
                  <Button
                    leftIcon={<Trash />}
                    variant="link"
                    color="text.primary"
                    onClick={handleDelete}
                    w="fit-content"
                  >
                    {t("ui.delete")}
                  </Button>
                )}
              </>
            )}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
