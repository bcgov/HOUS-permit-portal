import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  VStack,
  useDisclosure,
} from "@chakra-ui/react"
import { UppyFile } from "@uppy/core"
import React, { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import useUppyS3 from "../../../hooks/use-uppy-s3"
import { IInfoDocument } from "../../../models/info-document"
import { useMst } from "../../../setup/root"
import { EFileUploadAttachmentType } from "../../../types/enums"
import { CalloutBanner } from "../../shared/base/callout-banner"
import { FileDownloadButton } from "../../shared/base/file-download-button"
import { ConfirmationModal } from "../../shared/confirmation-modal"
import { TagsSelect } from "../../shared/select/selectors/tags-select"
import { UppyDashboard } from "../../shared/uppy-dashboard"

export interface IInfoDocumentFormData {
  title: string
  description?: string | null
  topics: string[]
  isPublished: boolean
  file?: {
    id: string
    storage: string
    metadata: {
      size: number
      filename: string
      mimeType: string
    }
  }
}

interface IInfoDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  document?: IInfoDocument | null
  onSubmit: (data: IInfoDocumentFormData) => Promise<boolean>
}

export const InfoDocumentModal = ({ isOpen, onClose, document, onSubmit }: IInfoDocumentModalProps) => {
  const { t } = useTranslation()
  const translate = t as any
  const { infoDocumentStore } = useMst()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<IInfoDocumentFormData>({
    defaultValues: {
      title: "",
      description: "",
      topics: [],
      isPublished: false,
    },
    shouldFocusError: false,
  })
  const [fileReplaceUnlocked, setFileReplaceUnlocked] = useState(false)
  const replaceConfirm = useDisclosure()
  const isPublished = watch("isPublished")
  const title = watch("title")

  const { uppy, isUploading } = useUppyS3({
    onUploadSuccess: (file: UppyFile<{}, {}>, response: any) => {
      setValue("file", {
        id: extractUploadedFileKey(file, response),
        storage: "cache",
        metadata: {
          size: file.size || 0,
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
        },
      })
      clearErrors("file")
    },
    onFileRemoved: () => {
      setValue("file", undefined)
    },
    maxNumberOfFiles: 1,
    autoProceed: true,
  })

  useEffect(() => {
    if (!isOpen) return

    resetUppy(uppy)
    setFileReplaceUnlocked(false)
    replaceConfirm.onClose()
    reset({
      title: document?.title ?? "",
      description: document?.description ?? "",
      topics: document?.topics ? [...document.topics] : [],
      isPublished: Boolean(document?.publishedAt),
    })
  }, [document, isOpen, reset, uppy])

  const fetchTopicOptions = async (query: string) => {
    const topics = await infoDocumentStore.searchTopics(query)
    return (topics || []).map((topic: string) => ({ value: topic, label: topic }))
  }

  const currentFileName = fileNameFor(document?.file)
  const hasExistingFile = Boolean(currentFileName)
  const requireReplaceConfirmation = Boolean(document?.publishedAt) && hasExistingFile && !fileReplaceUnlocked

  const submit = handleSubmit(async (data) => {
    if (isUploading) return

    const hasFile = Boolean(data.file) || hasExistingFile
    if (data.isPublished && !hasFile) {
      setError("file", {
        type: "required",
        message: translate("infoDocuments.management.errors.file"),
      })
      return
    }

    const success = await onSubmit(data)
    if (success) onClose()
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent
        as="form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void submit(event)
        }}
      >
        <ModalHeader>
          {document ? translate("infoDocuments.management.editTitle") : translate("infoDocuments.management.addTitle")}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={5} align="stretch">
            <FormControl isInvalid={!!errors.title}>
              <FormLabel>
                {translate("infoDocuments.management.fields.title")}
                <RequiredMark />
              </FormLabel>
              <Input
                {...register("title", {
                  validate: (value) => Boolean(value?.trim()) || translate("infoDocuments.management.errors.title"),
                })}
              />
              <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>{translate("infoDocuments.management.fields.shortDescription")}</FormLabel>
              <Textarea rows={3} maxLength={256} {...register("description", { maxLength: 256 })} />
              <FormHelperText>{translate("infoDocuments.management.fields.shortDescriptionHelp")}</FormHelperText>
            </FormControl>

            <FormControl isInvalid={!!errors.topics}>
              <FormLabel>
                {translate("infoDocuments.management.fields.topics")}
                <RequiredMark />
              </FormLabel>
              <Controller
                name="topics"
                control={control}
                rules={{
                  validate: (value) => value?.length > 0 || translate("infoDocuments.management.errors.topics"),
                }}
                render={({ field: { onChange, value } }) => (
                  <TagsSelect
                    onChange={(options) => onChange(options.map((option) => option.value))}
                    fetchOptions={fetchTopicOptions}
                    placeholder={translate("infoDocuments.management.fields.topicsPlaceholder")}
                    selectedOptions={(value || []).map((topic) => ({ value: topic, label: topic }))}
                    styles={{
                      container: (css) => ({ ...css, width: "100%" }),
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                    menuPortalTarget={window.document.body}
                  />
                )}
              />
              <FormHelperText>{translate("infoDocuments.management.fields.topicsHelp")}</FormHelperText>
              <FormErrorMessage>{errors.topics?.message as string}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <Checkbox {...register("isPublished")}>{translate("infoDocuments.management.fields.published")}</Checkbox>
            </FormControl>

            <FormControl isInvalid={!!errors.file}>
              <FormLabel>
                {translate("infoDocuments.management.fields.file")}
                {isPublished && <RequiredMark />}
              </FormLabel>
              {document?.file && currentFileName && (
                <FileDownloadButton
                  document={{
                    id: document.id,
                    file: document.file,
                    createdAt: document.createdAt ?? new Date(),
                  }}
                  modelType={EFileUploadAttachmentType.InfoDocument}
                  mb={2}
                />
              )}
              <Box position="relative">
                <UppyDashboard uppy={uppy} height={180} width="100%" />
                {requireReplaceConfirmation && (
                  <Box
                    as="button"
                    type="button"
                    position="absolute"
                    inset={0}
                    zIndex={1}
                    bg="transparent"
                    border="none"
                    p={0}
                    cursor="pointer"
                    aria-label={translate("infoDocuments.management.replaceFile")}
                    onClick={replaceConfirm.onOpen}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault()
                      replaceConfirm.onOpen()
                    }}
                  />
                )}
              </Box>
              <ConfirmationModal
                modalProps={{ size: "lg" }}
                modalControlProps={replaceConfirm}
                renderTriggerButton={() => null}
                title={translate("infoDocuments.management.replaceTitle")}
                body={
                  <VStack align="stretch" spacing={4}>
                    <Text>
                      {translate("infoDocuments.management.replaceBody", {
                        title: title?.trim() || document?.title,
                      })}
                    </Text>
                    <CalloutBanner type="warning" title={translate("infoDocuments.management.replaceWarning")} my={0} />
                  </VStack>
                }
                triggerText={translate("infoDocuments.management.replaceConfirm")}
                onConfirm={(closeModal) => {
                  setFileReplaceUnlocked(true)
                  closeModal()
                }}
              />
              <FormErrorMessage>{errors.file?.message as string}</FormErrorMessage>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter gap={4} justifyContent="flex-start">
          <Button variant="secondary" type="button" onClick={onClose} isDisabled={isSubmitting}>
            {translate("ui.cancel")}
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting} isDisabled={isUploading}>
            {translate("ui.save")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

function RequiredMark() {
  return (
    <Text as="span" color="semantic.error" ml={1}>
      *
    </Text>
  )
}

// Same as note attachments: last path segment of the cache URL is the Shrine file id.
const extractUploadedFileKey = (file: UppyFile<{}, {}>, response: any) => {
  const source = response?.uploadURL || response?.location || response?.key || ""
  const key = source.split("?")[0].split("/").pop()

  return key || file.name || file.id
}

const resetUppy = (uppy: any) => {
  uppy.cancelAll()
  uppy.getFiles().forEach((file) => uppy.removeFile(file.id))
}

const fileNameFor = (file: any) => {
  return file?.metadata?.filename
}
