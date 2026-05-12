import {
  Box,
  Button,
  Checkbox,
  FormControl,
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
  Select,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react"
import { UppyFile } from "@uppy/core"
import "@uppy/core/dist/style.min.css"
import "@uppy/dashboard/dist/style.css"
import Dashboard from "@uppy/react/lib/Dashboard.js"
import React, { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import useUppyS3 from "../../../hooks/use-uppy-s3"
import { IHelpVideo } from "../../../models/help-video"
import { IHelpVideoSection } from "../../../models/help-video-section"
import { Editor } from "../../shared/editor/editor"

const DEFAULT_ABOUT_HTML = "<p>Add about text</p><h3><b>Topics covered</b></h3><ul><li>...</li></ul>"

type TDocumentFieldName = "videoDocumentAttributes" | "captionDocumentAttributes" | "transcriptDocumentAttributes"

export interface IHelpVideoDocumentFormData {
  id?: string
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

export interface IHelpVideoFormData {
  title: string
  description?: string | null
  aboutHtml?: string
  helpVideoSectionId: string
  isPublished: boolean
  videoDocumentAttributes?: IHelpVideoDocumentFormData
  captionDocumentAttributes?: IHelpVideoDocumentFormData
  transcriptDocumentAttributes?: IHelpVideoDocumentFormData
}

interface IHelpVideoModalProps {
  isOpen: boolean
  onClose: () => void
  video?: IHelpVideo | null
  sections: IHelpVideoSection[]
  onSubmit: (data: IHelpVideoFormData) => Promise<boolean>
}

export const HelpVideoModal = ({ isOpen, onClose, video, sections, onSubmit }: IHelpVideoModalProps) => {
  const { t } = useTranslation()
  const translate = t as any
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<IHelpVideoFormData>({
    defaultValues: {
      title: "",
      description: "",
      aboutHtml: DEFAULT_ABOUT_HTML,
      helpVideoSectionId: "",
      isPublished: false,
    },
  })
  const documentIdsRef = useRef<Partial<Record<TDocumentFieldName, string>>>({})

  const buildUploadHandler = (fieldName: TDocumentFieldName) => {
    return (file: UppyFile<{}, {}>, response: any) => {
      setValue(fieldName, {
        id: documentIdsRef.current[fieldName],
        file: {
          id: extractUploadedFileKey(file, response),
          storage: "cache",
          metadata: {
            size: file.size || 0,
            filename: file.name,
            mimeType: file.type || "application/octet-stream",
          },
        },
      })
    }
  }

  const videoUppy = useUppyS3({
    onUploadSuccess: buildUploadHandler("videoDocumentAttributes"),
    maxNumberOfFiles: 1,
    autoProceed: true,
    allowedFileTypes: ["video/mp4"],
  })
  const captionUppy = useUppyS3({
    onUploadSuccess: buildUploadHandler("captionDocumentAttributes"),
    maxNumberOfFiles: 1,
    autoProceed: true,
    allowedFileTypes: [".vtt", "text/vtt"],
  })
  const transcriptUppy = useUppyS3({
    onUploadSuccess: buildUploadHandler("transcriptDocumentAttributes"),
    maxNumberOfFiles: 1,
    autoProceed: true,
    allowedFileTypes: [".txt", ".pdf", "text/plain", "application/pdf"],
  })

  useEffect(() => {
    if (!isOpen) return

    const nextAboutHtml = video?.aboutHtml ?? DEFAULT_ABOUT_HTML

    resetUppy(videoUppy)
    resetUppy(captionUppy)
    resetUppy(transcriptUppy)
    documentIdsRef.current = {
      videoDocumentAttributes: video?.videoDocument?.id,
      captionDocumentAttributes: video?.captionDocument?.id,
      transcriptDocumentAttributes: video?.transcriptDocument?.id,
    }

    reset({
      title: video?.title ?? "",
      description: video?.description ?? "",
      aboutHtml: nextAboutHtml,
      helpVideoSectionId: video?.helpVideoSectionId ?? sections[0]?.id ?? "",
      isPublished: Boolean(video?.publishedAt),
    })
  }, [captionUppy, isOpen, reset, sections, transcriptUppy, video, videoUppy])

  const submit = handleSubmit(async (data) => {
    const success = await onSubmit(data)
    if (success) onClose()
  })

  const selectedSectionId = watch("helpVideoSectionId")
  const aboutHtml = watch("aboutHtml")
  const hasSections = sections.length > 0

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalOverlay />
      <ModalContent as="form" onSubmit={submit}>
        <ModalHeader>
          {video
            ? translate("helpVideos.management.videos.editTitle")
            : translate("helpVideos.management.videos.addTitle")}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={5} align="stretch">
            <FormControl isRequired>
              <FormLabel>{translate("helpVideos.management.fields.title")}</FormLabel>
              <Input {...register("title", { required: true })} />
            </FormControl>
            <FormControl>
              <FormLabel>{translate("helpVideos.management.fields.shortDescription")}</FormLabel>
              <Textarea rows={3} maxLength={256} {...register("description", { maxLength: 256 })} />
              <FormHelperText>{translate("helpVideos.management.fields.shortDescriptionHelp")}</FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel>{translate("helpVideos.management.fields.about")}</FormLabel>
              <Editor htmlValue={aboutHtml} onChange={(value) => setValue("aboutHtml", value, { shouldDirty: true })} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>{translate("helpVideos.management.fields.section")}</FormLabel>
              <Select
                {...register("helpVideoSectionId", { required: true })}
                value={selectedSectionId}
                isDisabled={!hasSections}
              >
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.title}
                  </option>
                ))}
              </Select>
            </FormControl>
            <Checkbox {...register("isPublished")}>{translate("helpVideos.management.fields.published")}</Checkbox>

            <UploadField
              label={translate("helpVideos.management.fields.videoFile")}
              currentFileName={fileNameFor(video?.videoDocument?.file)}
              uppy={videoUppy}
            />
            <UploadField
              label={translate("helpVideos.management.fields.captionFile")}
              currentFileName={fileNameFor(video?.captionDocument?.file)}
              uppy={captionUppy}
            />
            <UploadField
              label={translate("helpVideos.management.fields.transcriptFile")}
              currentFileName={fileNameFor(video?.transcriptDocument?.file)}
              uppy={transcriptUppy}
            />
          </VStack>
        </ModalBody>
        <ModalFooter gap={4} justifyContent="flex-start">
          <Button variant="primary" type="submit" isLoading={isSubmitting} isDisabled={!hasSections}>
            {translate("ui.save")}
          </Button>
          <Button variant="secondary" onClick={onClose} isDisabled={isSubmitting}>
            {translate("ui.cancel")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

const UploadField = ({ label, currentFileName, uppy }: { label: string; currentFileName?: string; uppy: any }) => {
  const { t } = useTranslation()

  return (
    <Box>
      <Text fontWeight="semibold" mb={2}>
        {label}
      </Text>
      {currentFileName && (
        <Text fontSize="sm" color="text.secondary" mb={2}>
          {(t as any)("helpVideos.management.fields.currentFile", { fileName: currentFileName })}
        </Text>
      )}
      <Dashboard uppy={uppy} height={180} width="100%" proudlyDisplayPoweredByUppy={false} />
    </Box>
  )
}

const extractUploadedFileKey = (file: UppyFile<{}, {}>, response: any) => {
  if (response.uploadURL) {
    return response.uploadURL.split("/").pop() || file.id
  }
  if (response.key) {
    return response.key.split("/").pop() || file.id
  }
  return file.id
}

const resetUppy = (uppy: any) => {
  uppy.cancelAll()
  uppy.getFiles().forEach((file) => uppy.removeFile(file.id))
}

const fileNameFor = (file: any) => {
  return file?.metadata?.filename
}
