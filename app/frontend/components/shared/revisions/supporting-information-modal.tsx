import {
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
} from "@chakra-ui/react"
import { Trash } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { UseFieldArrayReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../models/permit-application"
import { useMst } from "../../../setup/root"
import { ERevisionRequestType } from "../../../types/enums"
import { IRevisionRequest } from "../../../types/types"
import { IRevisionRequestForm } from "../../domains/permit-application/revision-sidebar"
import { useNoteAttachments } from "../notes/use-note-attachments"
import { IRevisionFileGridItem, RevisionFileGrid } from "./revision-file-grid"

interface ISupportingInformationModalProps {
  isOpen: boolean
  onClose: () => void
  supportingInformationRequest?: IRevisionRequest
  useFieldArrayMethods: UseFieldArrayReturn<IRevisionRequestForm, "revisionRequestsAttributes", "fieldId">
  onSave: () => Promise<void>
  disableInput?: boolean
  allowFulfillmentUpload?: boolean
  permitApplication?: IPermitApplication
}

export const SupportingInformationModal = observer(
  ({
    isOpen,
    onClose,
    supportingInformationRequest,
    useFieldArrayMethods,
    onSave,
    disableInput,
    allowFulfillmentUpload,
    permitApplication,
  }: ISupportingInformationModalProps) => {
    const { t } = useTranslation()
    const { userStore } = useMst()
    const { currentUser } = userStore
    const { update, append, fields } = useFieldArrayMethods
    const { attachments, isUploading, addFiles, removeAttachment, clearAttachments } = useNoteAttachments({
      maxNumberOfFiles: 10,
    })

    const [title, setTitle] = useState(supportingInformationRequest?.title ?? "")
    const [comment, setComment] = useState(supportingInformationRequest?.comment ?? "")
    const [destroyedDocumentIds, setDestroyedDocumentIds] = useState<string[]>([])
    const [destroyedFulfillmentIds, setDestroyedFulfillmentIds] = useState<string[]>([])

    const existingDocuments = (supportingInformationRequest?.revisionReferenceDocuments || []).filter(
      (doc) => !destroyedDocumentIds.includes(doc.id)
    )
    const fulfillmentDocuments = (supportingInformationRequest?.supportingDocuments || []).filter(
      (doc) => !destroyedFulfillmentIds.includes(doc.id)
    )

    useEffect(() => {
      if (!isOpen) return
      setTitle(supportingInformationRequest?.title ?? "")
      setComment(supportingInformationRequest?.comment ?? "")
      setDestroyedDocumentIds([])
      setDestroyedFulfillmentIds([])
      clearAttachments()
    }, [isOpen, supportingInformationRequest?.id])

    const index = fields.findIndex((field) => field.id === supportingInformationRequest?.id)

    const handleClose = () => {
      clearAttachments()
      onClose()
    }

    const handleUpsert = () => {
      if (!title.trim()) return

      const revisionReferenceDocumentsAttributes = [
        ...destroyedDocumentIds.map((id) => ({ id, _destroy: true as const })),
        ...attachments.map((attachment) => ({
          file: attachment.file,
        })),
      ]

      const newItem = {
        id: supportingInformationRequest?.id,
        userId: currentUser.id,
        type: ERevisionRequestType.SupportingDocumentRevisionRequest,
        title: title.trim(),
        comment,
        revisionReferenceDocumentsAttributes,
      }

      if (supportingInformationRequest && index >= 0) {
        update(index, newItem)
      } else {
        append(newItem)
      }

      onSave().then(handleClose)
    }

    const handleDelete = () => {
      if (!supportingInformationRequest?.id) return
      update(index, { _destroy: true, id: supportingInformationRequest.id })
      onSave().then(handleClose)
    }

    const handleSaveFulfillment = () => {
      if (!supportingInformationRequest?.id || !permitApplication) return

      const supportingDocumentsAttributes = [
        ...destroyedFulfillmentIds.map((id) => ({
          id,
          _destroy: true,
          revisionRequestId: supportingInformationRequest.id,
        })),
        ...attachments.map((attachment) => ({
          revisionRequestId: supportingInformationRequest.id,
          file: attachment.file,
        })),
      ]

      if (supportingDocumentsAttributes.length === 0) {
        handleClose()
        return
      }

      permitApplication.uploadRevisionFulfillment(supportingDocumentsAttributes).then((response) => {
        if (response?.ok) handleClose()
      })
    }

    const stagedFiles: IRevisionFileGridItem[] = attachments.map((attachment) => ({
      id: attachment.uppyFileId,
      name: attachment.file.metadata.filename,
      size: attachment.file.metadata.size,
      onRemove: () => removeAttachment(attachment.uppyFileId),
    }))
    const referenceFiles: IRevisionFileGridItem[] = existingDocuments.map((doc) => ({
      id: doc.id,
      name: doc.file?.metadata?.filename || "",
      size: doc.file?.metadata?.size,
      href: doc.fileUrl,
      onRemove: disableInput ? undefined : () => setDestroyedDocumentIds((ids) => [...ids, doc.id]),
    }))
    const uploadedFulfillmentFiles: IRevisionFileGridItem[] = fulfillmentDocuments.map((doc) => ({
      id: doc.id,
      name: doc.fileName,
      href: doc.fileUrl,
      onRemove: allowFulfillmentUpload ? () => setDestroyedFulfillmentIds((ids) => [...ids, doc.id]) : undefined,
    }))

    const referenceFileList =
      referenceFiles.length === 0 ? null : (
        <Flex direction="column" gap={1}>
          {referenceFiles.map((file) => (
            <Flex key={file.id} justify="space-between" align="center">
              {file.href ? (
                <Button
                  as="a"
                  href={file.href}
                  target="_blank"
                  rel="noopener"
                  variant="link"
                  justifyContent="flex-start"
                >
                  {file.name}
                </Button>
              ) : (
                <Text>{file.name}</Text>
              )}
              {file.onRemove && (
                <Button variant="link" onClick={file.onRemove}>
                  {t("ui.delete")}
                </Button>
              )}
            </Flex>
          ))}
        </Flex>
      )

    const actionButtons = (primaryLabel: string, onPrimary: () => void, primaryDisabled: boolean) => (
      <Flex justify="flex-start" gap={4}>
        <Button onClick={onPrimary} variant="primary" isDisabled={primaryDisabled}>
          {primaryLabel}
        </Button>
        <Button variant="secondary" onClick={handleClose}>
          {t("ui.cancel")}
        </Button>
      </Flex>
    )

    return (
      <Modal onClose={handleClose} isOpen={isOpen} size="xl">
        <ModalOverlay />
        <ModalContent mt={48}>
          <ModalHeader textAlign="left" px={10} pt={10} pb={4}>
            <ModalCloseButton fontSize="11px" />
            <Heading as="h3" fontSize="2xl" textAlign="left">
              {allowFulfillmentUpload
                ? t("permitApplication.show.revision.submitterInformationTitle")
                : t("permitApplication.show.revision.addSupportingInformation")}
            </Heading>
          </ModalHeader>
          <ModalBody px={10} pt={0} pb={10}>
            <Flex direction="column" gap={4} align="stretch">
              {allowFulfillmentUpload ? (
                <>
                  <Flex direction="column" gap={1}>
                    <Text fontWeight="bold">{t("permitApplication.show.revision.informationRequested")}</Text>
                    <Text>{title}</Text>
                  </Flex>
                  <Flex direction="column" gap={1}>
                    <Text fontWeight="bold">{t("permitApplication.show.revision.whyThisIsNeeded")}</Text>
                    <Text>{comment || t("permitApplication.show.revision.notProvided")}</Text>
                  </Flex>
                  {referenceFileList}
                  <Flex direction="column" gap={2}>
                    <Text fontWeight="bold">{t("permitApplication.show.revision.uploadAFile")}</Text>
                    <RevisionFileGrid
                      files={[...uploadedFulfillmentFiles, ...stagedFiles]}
                      onAddFiles={addFiles}
                      showDropzone
                    />
                  </Flex>
                  {actionButtons(
                    t("permitApplication.show.revision.save"),
                    handleSaveFulfillment,
                    isUploading || (attachments.length === 0 && destroyedFulfillmentIds.length === 0)
                  )}
                </>
              ) : disableInput ? (
                <>
                  <Flex direction="column" gap={1}>
                    <Text fontWeight="bold">{t("permitApplication.show.revision.informationRequested")}</Text>
                    <Text>{title}</Text>
                  </Flex>
                  <Flex direction="column" gap={1}>
                    <Text fontWeight="bold">{t("permitApplication.show.revision.whyThisIsNeeded")}</Text>
                    <Text>{comment || t("permitApplication.show.revision.notProvided")}</Text>
                  </Flex>
                  {referenceFileList}
                  <Flex justify="flex-start">
                    <Button variant="secondary" onClick={onClose}>
                      {t("ui.close")}
                    </Button>
                  </Flex>
                </>
              ) : (
                <>
                  <FormControl isRequired>
                    <FormLabel>{t("permitApplication.show.revision.nameRequestedInformation")}</FormLabel>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} bg="white" />
                    <FormHelperText>
                      {t("permitApplication.show.revision.nameRequestedInformationHelper")}
                    </FormHelperText>
                  </FormControl>
                  <Flex direction="column" gap={2}>
                    <Text fontWeight="bold">{t("permitApplication.show.revision.uploadReferenceDocument")}</Text>
                    {referenceFileList}
                    <RevisionFileGrid files={stagedFiles} onAddFiles={addFiles} showDropzone />
                  </Flex>
                  <FormControl>
                    <FormLabel>{t("permitApplication.show.revision.explanationToApplicant")}</FormLabel>
                    <Textarea value={comment} onChange={(e) => setComment(e.target.value)} />
                    <FormHelperText>
                      {t("permitApplication.show.revision.explanationForInformationHelper")}
                    </FormHelperText>
                  </FormControl>
                  {actionButtons(
                    supportingInformationRequest ? t("ui.change") : t("ui.add"),
                    handleUpsert,
                    !title.trim() || isUploading
                  )}
                  {supportingInformationRequest && (
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
)
