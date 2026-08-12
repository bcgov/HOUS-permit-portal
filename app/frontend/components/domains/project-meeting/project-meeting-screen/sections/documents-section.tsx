import { Heading, ListItem, Text, UnorderedList } from "@chakra-ui/react"
import { UppyFile } from "@uppy/core"
import { observer } from "mobx-react-lite"
import React from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import useUppyS3 from "../../../../../hooks/use-uppy-s3"
import { IProjectMeeting } from "../../../../../models/project-meeting"
import { useMst } from "../../../../../setup/root"
import { EFlashMessageStatus, EMeetingRequestDocumentType } from "../../../../../types/enums"
import { useProjectMeetingNavigation } from "../../use-project-meeting-navigation"
import { documentsForType } from "../shared/document-utils"
import { DocumentsTable } from "../shared/documents-table"
import { FormActions } from "../shared/form-actions"
import { SectionHeading } from "../shared/section-heading"
import { MeetingRequestDocumentFormValue } from "../shared/types"
import { UppyDashboardField } from "../shared/uppy-dashboard-field"

interface DocumentsSectionProps {
  meeting: IProjectMeeting
}

export const DocumentsSection = observer(({ meeting }: DocumentsSectionProps) => {
  const { t } = useTranslation()
  const { permitProjectId } = useParams<{ permitProjectId: string }>()
  const { projectMeetingStore, uiStore } = useMst()
  const { navigateToNext } = useProjectMeetingNavigation()
  const { control, handleSubmit, watch, formState } = useForm<{
    meetingRequestDocumentsAttributes: MeetingRequestDocumentFormValue[]
  }>({
    defaultValues: {
      meetingRequestDocumentsAttributes: [...meeting.meetingRequestDocuments],
    },
  })
  const { append, update } = useFieldArray({ control, name: "meetingRequestDocumentsAttributes" })
  const documents = watch("meetingRequestDocumentsAttributes") || []
  const supportingDocuments = documentsForType(documents, EMeetingRequestDocumentType.supporting)

  const handleUploadSuccess = (file: UppyFile<{}, {}>, response: any) => {
    const uploadUrl = response.uploadURL || response.location || ""
    const parts = uploadUrl.split("/")
    const key = parts[parts.length - 1]
    append(
      {
        projectMeetingId: meeting.id,
        documentType: EMeetingRequestDocumentType.supporting,
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
  }

  const { uppy: supportingDocumentsUppy, isUploading } = useUppyS3({
    onUploadSuccess: handleUploadSuccess,
    maxNumberOfFiles: 10,
    autoProceed: true,
  })

  const handleRemoveFile = (documentId: string) => {
    const index = documents.findIndex((doc) => (doc.id || doc.file?.id) === documentId)
    if (index !== -1) update(index, { ...documents[index], _destroy: true })
  }

  const handleUndoRemoveFile = (documentId: string) => {
    const index = documents.findIndex((doc) => (doc.id || doc.file?.id) === documentId)
    if (index !== -1) update(index, { ...documents[index], _destroy: false })
  }

  const onSubmit = async (data) => {
    if (isUploading) return

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
        title={t("projectMeeting.sections.documents.title")}
        description={t("projectMeeting.sections.documents.description")}
      />
      <Text mb={2}>{t("projectMeeting.sections.documents.examplesIntro")}</Text>
      <UnorderedList mb={6}>
        <ListItem>{t("projectMeeting.sections.documents.drawings")}</ListItem>
        <ListItem>{t("projectMeeting.sections.documents.photos")}</ListItem>
        <ListItem>{t("projectMeeting.sections.documents.sitePlans")}</ListItem>
        <ListItem>{t("projectMeeting.sections.documents.floorPlans")}</ListItem>
      </UnorderedList>
      <Heading as="h2" size="md" mb={2}>
        {t("projectMeeting.sections.documents.supportingTitle")}
      </Heading>
      <DocumentsTable
        documents={supportingDocuments}
        onRemoveFile={handleRemoveFile}
        onUndoRemoveFile={handleUndoRemoveFile}
      />
      <UppyDashboardField uppy={supportingDocumentsUppy} />
      <FormActions
        isSubmitting={formState.isSubmitting}
        isDisabled={isUploading}
        continueLabel={t("ui.saveAndcontinue")}
      />
    </form>
  )
})
