import { Box, FormControl, FormErrorMessage, Heading, Link, Text, VStack } from "@chakra-ui/react"
import { UppyFile } from "@uppy/core"
import { observer } from "mobx-react-lite"
import React from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { usePermitProject } from "../../../../../hooks/resources/use-permit-project"
import useUppyS3 from "../../../../../hooks/use-uppy-s3"
import { IProjectMeeting } from "../../../../../models/project-meeting"
import { useMst } from "../../../../../setup/root"
import {
  EFileUploadAttachmentType,
  EFlashMessageStatus,
  EMeetingRequestDocumentType,
  EResourceCategory,
  EResourceType,
} from "../../../../../types/enums"
import { FileDownloadButton } from "../../../../shared/base/file-download-button"
import { useProjectMeetingNavigation } from "../../use-project-meeting-navigation"
import { ACCEPTED_DOCUMENT_TYPES } from "../shared/constants"
import { activeDocumentsForType } from "../shared/document-utils"
import { DocumentsTable } from "../shared/documents-table"
import { FormActions } from "../shared/form-actions"
import { SectionHeading } from "../shared/section-heading"
import { MeetingRequestDocumentFormValue } from "../shared/types"
import { UppyDashboardField } from "../shared/uppy-dashboard-field"

interface AuthorizationDocumentsSectionProps {
  meeting: IProjectMeeting
}

export const AuthorizationDocumentsSection = observer(({ meeting }: AuthorizationDocumentsSectionProps) => {
  const { t } = useTranslation()
  const { permitProjectId } = useParams<{ permitProjectId: string }>()
  const { currentPermitProject } = usePermitProject()
  const { projectMeetingStore, uiStore } = useMst()
  const { navigateToNext } = useProjectMeetingNavigation()
  const { control, handleSubmit, watch, formState, setError, clearErrors } = useForm<{
    meetingRequestDocumentsAttributes: MeetingRequestDocumentFormValue[]
  }>({
    defaultValues: {
      meetingRequestDocumentsAttributes: [...meeting.meetingRequestDocuments],
    },
  })
  const { append, update } = useFieldArray({ control, name: "meetingRequestDocumentsAttributes" })
  const documents = watch("meetingRequestDocumentsAttributes") || []
  const authorizationDocuments = activeDocumentsForType(documents, EMeetingRequestDocumentType.authorization)
  const documentError = formState.errors.meetingRequestDocumentsAttributes?.message as string | undefined
  const authorizationResources =
    currentPermitProject?.jurisdiction?.resources?.filter(
      (resource) => resource.category === EResourceCategory.projectMeetingAuthorization
    ) || []

  const handleUploadSuccess =
    (documentType: EMeetingRequestDocumentType) => (file: UppyFile<{}, {}>, response: any) => {
      const uploadUrl = response.uploadURL || response.location || ""
      const parts = uploadUrl.split("/")
      const key = parts[parts.length - 1]
      append(
        {
          projectMeetingId: meeting.id,
          documentType,
          file: {
            id: key || file.name,
            storage: "cache",
            metadata: {
              size: file.size || 0,
              filename: file.name,
              mimeType: file.type || "application/pdf",
            },
          },
          createdAt: new Date(),
        },
        { shouldFocus: false }
      )
      if (documentType === EMeetingRequestDocumentType.authorization) {
        clearErrors("meetingRequestDocumentsAttributes")
      }
    }

  const authorizationUppy = useUppyS3({
    onUploadSuccess: handleUploadSuccess(EMeetingRequestDocumentType.authorization),
    maxNumberOfFiles: 10,
    autoProceed: true,
    maxFileSizeMB: 10,
    allowedFileTypes: ACCEPTED_DOCUMENT_TYPES,
  })

  const handleRemoveFile = (documentId: string) => {
    const index = documents.findIndex((doc) => (doc.id || doc.file?.id) === documentId)
    if (index !== -1) update(index, { ...documents[index], _destroy: true })
  }

  const onSubmit = async (data) => {
    if (
      activeDocumentsForType(data.meetingRequestDocumentsAttributes, EMeetingRequestDocumentType.authorization)
        .length === 0
    ) {
      setError("meetingRequestDocumentsAttributes", {
        type: "manual",
        message: t("projectMeeting.validation.authorizationDocumentsRequired"),
      })
      return
    }

    const response = await projectMeetingStore.updateProjectMeeting(permitProjectId, meeting.id, data)
    if (response.ok) {
      navigateToNext()
    } else {
      uiStore.flashMessage.show(EFlashMessageStatus.error, null, t("projectMeeting.validation.saveError"), 5000)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SectionHeading
        title={t("projectMeeting.sections.documents.authorizationTitle")}
        description={t("projectMeeting.sections.documents.authorizationDescription")}
      />
      <Box mb={8}>
        <Heading as="h2" size="md" mb={2}>
          {t("projectMeeting.sections.documents.authorizationResourcesTitle")}
        </Heading>
        <Text mb={4}>{t("projectMeeting.sections.documents.authorizationResourcesDescription")}</Text>
        {authorizationResources.length > 0 ? (
          <VStack align="stretch" spacing={3}>
            {authorizationResources.map((resource) => (
              <Box key={resource.id} borderWidth={1} borderColor="border.light" borderRadius="md" p={4}>
                <Text fontWeight="bold">{resource.title}</Text>
                {resource.description && (
                  <Text color="text.secondary" mt={1}>
                    {resource.description}
                  </Text>
                )}
                {resource.resourceType === EResourceType.file && resource.resourceDocument && (
                  <FileDownloadButton
                    document={resource.resourceDocument}
                    modelType={EFileUploadAttachmentType.ResourceDocument}
                  />
                )}
                {resource.resourceType === EResourceType.link && resource.linkUrl && (
                  <Link href={resource.linkUrl} isExternal color="text.link">
                    {resource.linkUrl}
                  </Link>
                )}
              </Box>
            ))}
          </VStack>
        ) : (
          <Text color="text.secondary">{t("projectMeeting.sections.documents.noAuthorizationResources")}</Text>
        )}
      </Box>
      <FormControl isRequired isInvalid={!!documentError} mb={8}>
        <DocumentsTable documents={authorizationDocuments} onRemoveFile={handleRemoveFile} />
        <UppyDashboardField
          uppy={authorizationUppy}
          acceptedFormatsLabel={t("projectMeeting.sections.documents.acceptedFormats")}
          mb={2}
        />
        <FormErrorMessage>{documentError}</FormErrorMessage>
      </FormControl>
      <FormActions isSubmitting={formState.isSubmitting} />
    </form>
  )
})
