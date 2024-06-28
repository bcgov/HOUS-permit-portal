import {
  Box,
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
import { EReasonCode } from "../../../types/enums"
import { IFormIORequirement, IRevisionRequest } from "../../../types/types"
import { singleRequirementFormJson } from "../../../utils/formio-helpers"
import { IRevisionRequestForm } from "../../domains/permit-application/revision-sidebar"
import { Form } from "../chefs"

export interface IRevisionModalProps extends Partial<ReturnType<typeof useDisclosure>> {
  requirementJson: IFormIORequirement
  submissionJson: any
  revisionRequest: IRevisionRequest
  useFieldArrayMethods: UseFieldArrayReturn<IRevisionRequestForm, "revisionRequestsAttributes", "fieldId">
  onSave: () => Promise<void>
  isRevisionsRequested?: boolean
}

export const RevisionModal: React.FC<IRevisionModalProps> = ({
  requirementJson,
  submissionJson,
  isOpen,
  onOpen,
  onClose,
  revisionRequest,
  useFieldArrayMethods,
  onSave,
  isRevisionsRequested,
}) => {
  const { t } = useTranslation()
  const [reasonCode, setReasonCode] = useState<EReasonCode | "">(revisionRequest?.reasonCode ?? "")
  const [comment, setComment] = useState<string>(revisionRequest?.comment ?? "")

  const { update, append, fields } = useFieldArrayMethods

  const { userStore } = useMst()
  const { currentUser } = userStore

  const className = `formio-component-${requirementJson.key}`
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
    if (reasonCode && requirementJson) {
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

  const requirementForm = singleRequirementFormJson(requirementJson)

  return (
    <Modal onClose={handleClose} isOpen={isOpen} size="lg">
      <ModalOverlay />

      <ModalContent mt={48}>
        <ModalHeader textAlign="center">
          <ModalCloseButton fontSize="11px" />
          <Heading as="h3" fontSize="xl">
            {t("permitApplication.show.revision.requestRevision")}
          </Heading>
        </ModalHeader>
        <ModalBody>
          <Flex direction="column" gap={4}>
            <FormControl>
              <FormLabel>{t("permitApplication.show.revision.reasonFor")}</FormLabel>
              <Select
                placeholder={t("ui.pleaseSelect")}
                value={reasonCode}
                onChange={(e) => setReasonCode(e.target.value as EReasonCode)}
                isDisabled={isRevisionsRequested}
              >
                {Object.values(EReasonCode).map((value) => (
                  <option value={value} key={value}>
                    {t(`permitApplication.show.revision.reasons.${value}`)}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>{t("permitApplication.show.revision.comment")}</FormLabel>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("permitApplication.show.revision.comment")}
                maxLength={350}
                isDisabled={isRevisionsRequested}
              />
              <FormHelperText>{t("permitApplication.show.revision.maxCharacters")}</FormHelperText>
            </FormControl>

            <Divider />
            <Box className="form-wrapper single-requirement-form">
              <FormLabel>{t("permitApplication.show.revision.originallySubmitted")}</FormLabel>
              <Form form={requirementForm} submission={submissionJson} options={{ readOnly: true }} />
            </Box>
          </Flex>
          <ModalFooter>
            <Flex width="full" justify="center" gap={4}>
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
            </Flex>
          </ModalFooter>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
