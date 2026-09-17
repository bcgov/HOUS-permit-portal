import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Text,
  Textarea,
} from "@chakra-ui/react"
import { Trash } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { UseFieldArrayReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { ISupportingInformationRequest } from "../../../types/types"
import { IRevisionRequestForm } from "../../domains/permit-application/revision-sidebar"
import { NoteAttachmentChips } from "../notes/note-attachment-chips"
import { useNoteAttachments } from "../notes/use-note-attachments"
import { UppyDashboard } from "../uppy-dashboard"

interface ISupportingInformationModalProps {
  isOpen: boolean
  onClose: () => void
  supportingInformationRequest?: ISupportingInformationRequest
  useFieldArrayMethods: UseFieldArrayReturn<IRevisionRequestForm, "supportingInformationRequestsAttributes", "fieldId">
  onSave: () => Promise<void>
  disableInput?: boolean
}

export const SupportingInformationModal = observer(
  ({
    isOpen,
    onClose,
    supportingInformationRequest,
    useFieldArrayMethods,
    onSave,
    disableInput,
  }: ISupportingInformationModalProps) => {
    const { t } = useTranslation()
    const { userStore } = useMst()
    const { currentUser } = userStore
    const { update, append, fields } = useFieldArrayMethods
    const { attachments, isUploading, removeAttachment, clearAttachments, uppy } = useNoteAttachments({
      maxNumberOfFiles: 10,
    })

    const [title, setTitle] = useState(supportingInformationRequest?.title ?? "")
    const [comment, setComment] = useState(supportingInformationRequest?.comment ?? "")
    const [destroyedDocumentIds, setDestroyedDocumentIds] = useState<string[]>([])

    const existingDocuments = (supportingInformationRequest?.projectDocuments || []).filter(
      (doc) => !destroyedDocumentIds.includes(doc.id)
    )

    useEffect(() => {
      if (!isOpen) return
      setTitle(supportingInformationRequest?.title ?? "")
      setComment(supportingInformationRequest?.comment ?? "")
      setDestroyedDocumentIds([])
      clearAttachments()
    }, [isOpen, supportingInformationRequest?.id])

    const index = fields.findIndex((field) => field.id === supportingInformationRequest?.id)

    const handleClose = () => {
      clearAttachments()
      onClose()
    }

    const handleUpsert = () => {
      if (!title.trim()) return

      const projectDocumentsAttributes = [
        ...destroyedDocumentIds.map((id) => ({ id, _destroy: true })),
        ...attachments.map((attachment) => ({
          file: attachment.file,
          kind: "reference" as const,
          uploadedById: currentUser.id,
        })),
      ]

      const newItem = {
        id: supportingInformationRequest?.id,
        userId: currentUser.id,
        title: title.trim(),
        comment,
        projectDocumentsAttributes,
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

    return (
      <Modal onClose={handleClose} isOpen={isOpen} size="2xl">
        <ModalOverlay />
        <ModalContent mt={48}>
          <ModalHeader textAlign="center">
            <ModalCloseButton fontSize="11px" />
            <Heading as="h3" fontSize="xl">
              {t("permitApplication.show.revision.addSupportingInformation")}
            </Heading>
          </ModalHeader>
          <ModalBody>
            <Flex direction="column" gap={4}>
              <FormControl isRequired>
                <FormLabel>{t("permitApplication.show.revision.supportingInformationTitle")}</FormLabel>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} isDisabled={disableInput} bg="white" />
              </FormControl>
              <FormControl>
                <FormLabel>{t("permitApplication.show.revision.supportingInformationDescription")}</FormLabel>
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} isDisabled={disableInput} />
              </FormControl>
              {!disableInput && (
                <FormControl>
                  <FormLabel>{t("permitApplication.show.revision.supportingInformationFiles")}</FormLabel>
                  <UppyDashboard uppy={uppy} width="100%" height={220} />
                  <NoteAttachmentChips attachments={attachments} onRemove={removeAttachment} />
                </FormControl>
              )}
              {existingDocuments.length > 0 && (
                <Flex direction="column" gap={1}>
                  {existingDocuments.map((doc) => (
                    <Flex key={doc.id} justify="space-between" align="center">
                      <Text fontSize="sm">{doc.file?.metadata?.filename}</Text>
                      {!disableInput && (
                        <Button
                          variant="link"
                          color="semantic.error"
                          onClick={() => setDestroyedDocumentIds((ids) => [...ids, doc.id])}
                        >
                          {t("ui.delete")}
                        </Button>
                      )}
                    </Flex>
                  ))}
                </Flex>
              )}
            </Flex>
            <ModalFooter>
              <Flex width="full" justify="center" gap={4}>
                {disableInput ? (
                  <Button variant="secondary" onClick={onClose}>
                    {t("ui.ok")}
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleUpsert} variant="primary" isDisabled={!title.trim() || isUploading}>
                      {t("permitApplication.show.revision.addItem")}
                    </Button>
                    <Button variant="secondary" onClick={handleClose}>
                      {t("ui.cancel")}
                    </Button>
                    <Spacer />
                    {supportingInformationRequest && (
                      <Button color="semantic.error" leftIcon={<Trash />} variant="link" onClick={handleDelete}>
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
)
