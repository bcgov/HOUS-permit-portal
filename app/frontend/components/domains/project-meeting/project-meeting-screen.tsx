import {
  Box,
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
  Link,
  ListItem,
  Radio,
  RadioGroup,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  UnorderedList,
  VStack,
} from "@chakra-ui/react"
import { CaretLeft } from "@phosphor-icons/react"
import { UppyFile } from "@uppy/core"
import "@uppy/core/dist/style.min.css"
import Dashboard from "@uppy/react/lib/Dashboard.js"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom"
import { usePermitProject } from "../../../hooks/resources/use-permit-project"
import { useProjectMeeting } from "../../../hooks/resources/use-project-meeting"
import useUppyS3 from "../../../hooks/use-uppy-s3"
import { IProjectMeeting } from "../../../models/project-meeting"
import { useMst } from "../../../setup/root"
import {
  EFileUploadAttachmentType,
  EFlashMessageStatus,
  EMeetingRequestDocumentType,
  EProjectMeetingRequesterRelationship,
  EResourceCategory,
  EResourceType,
} from "../../../types/enums"
import { IMeetingRequestDocument } from "../../../types/types"
import { ErrorScreen } from "../../shared/base/error-screen"
import { FileDownloadButton } from "../../shared/base/file-download-button"
import { LoadingScreen } from "../../shared/base/loading-screen"
import ProjectInfoRow from "../../shared/project/project-info-row"
import { useProjectMeetingNavigation } from "./use-project-meeting-navigation"

interface SummarySectionProps {
  title: string
  sectionKey: string
  children: React.ReactNode
}

type MeetingRequestDocumentFormValue = Partial<IMeetingRequestDocument>

const ACCEPTED_DOCUMENT_TYPES = ["application/pdf", ".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"]

const getDocumentType = (document: MeetingRequestDocumentFormValue) =>
  document.documentType || EMeetingRequestDocumentType.supporting

const activeDocumentsForType = (
  documents: MeetingRequestDocumentFormValue[],
  documentType: EMeetingRequestDocumentType
) => documents.filter((document) => !document._destroy && getDocumentType(document) === documentType)

const FormActions = ({ isSubmitting }: { isSubmitting?: boolean }) => {
  const { t } = useTranslation()
  const { navigateToPrevious, hasPrevious } = useProjectMeetingNavigation()
  const navigate = useNavigate()
  const { permitProjectId } = useParams<{ permitProjectId: string }>()

  return (
    <HStack spacing={3} mt={8}>
      {hasPrevious ? (
        <Button variant="secondary" onClick={navigateToPrevious}>
          {t("ui.back")}
        </Button>
      ) : (
        <Button variant="secondary" onClick={() => navigate(`/projects/${permitProjectId}/overview`)}>
          {t("ui.back")}
        </Button>
      )}
      <Button type="submit" variant="primary" isLoading={isSubmitting}>
        {t("ui.continue")}
      </Button>
    </HStack>
  )
}

const SectionHeading = ({ title, description }: { title: string; description?: string }) => (
  <Box mb={6}>
    <Heading as="h1" size="xl" mb={3}>
      {title}
    </Heading>
    {description && <Text>{description}</Text>}
  </Box>
)

const ProjectInformationSection = observer(() => {
  const { t } = useTranslation()
  const { currentPermitProject } = usePermitProject()
  const { navigateToNext } = useProjectMeetingNavigation()

  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <SectionHeading
        title={t("projectMeeting.sections.projectInformation.title")}
        description={t("projectMeeting.sections.projectInformation.description")}
      />
      <Heading as="h2" size="md" mb={4}>
        {t("projectMeeting.projectInformation")}
      </Heading>
      <ProjectInfoRow label={t("permitProject.overview.address")} value={currentPermitProject?.fullAddress} isBold />
      <ProjectInfoRow label={t("permitProject.overview.pid")} value={currentPermitProject?.pid} />
      <ProjectInfoRow
        label={t("permitProject.overview.jurisdictionName")}
        value={currentPermitProject?.jurisdiction?.disambiguatedName}
      />
      <HStack spacing={3} mt={8}>
        <Button variant="secondary" as={RouterLink} to={`/projects/${currentPermitProject?.id}/overview`}>
          {t("ui.back")}
        </Button>
        <Button variant="primary" onClick={navigateToNext}>
          {t("ui.continue")}
        </Button>
      </HStack>
    </form>
  )
})

const RelationshipSection = observer(({ meeting }: { meeting: IProjectMeeting }) => {
  const { t } = useTranslation()
  const { permitProjectId } = useParams<{ permitProjectId: string }>()
  const { projectMeetingStore, uiStore } = useMst()
  const { navigateToNext } = useProjectMeetingNavigation()
  const { control, handleSubmit, formState } = useForm({
    defaultValues: { requesterRelationship: meeting.requesterRelationship || "" },
  })
  const relationshipError = formState.errors.requesterRelationship

  const onSubmit = async (data) => {
    const response = await projectMeetingStore.updateProjectMeeting(permitProjectId, meeting.id, data)
    if (response.ok) {
      navigateToNext()
    } else {
      uiStore.flashMessage.show(EFlashMessageStatus.error, null, t("projectMeeting.validation.saveError"), 5000)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SectionHeading title={t("projectMeeting.sections.relationship.title")} />
      <FormControl isRequired isInvalid={!!relationshipError}>
        <Controller
          name="requesterRelationship"
          control={control}
          rules={{ required: t("projectMeeting.validation.relationshipRequired") }}
          render={({ field }) => (
            <RadioGroup value={field.value} onChange={field.onChange}>
              <Stack spacing={3}>
                {Object.values(EProjectMeetingRequesterRelationship).map((relationship) => (
                  <Radio key={relationship} value={relationship}>
                    {t(`projectMeeting.relationships.${relationship}`)}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
          )}
        />
        <FormErrorMessage>{relationshipError?.message as string}</FormErrorMessage>
      </FormControl>
      <FormActions isSubmitting={formState.isSubmitting} />
    </form>
  )
})

const ContactDetailsSection = observer(({ meeting }: { meeting: IProjectMeeting }) => {
  const { t } = useTranslation()
  const { permitProjectId } = useParams<{ permitProjectId: string }>()
  const { projectMeetingStore, uiStore } = useMst()
  const { navigateToNext } = useProjectMeetingNavigation()
  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      contactName: meeting.contactName || "",
      contactEmail: meeting.contactEmail || "",
      contactPhoneNumber: meeting.contactPhoneNumber || "",
    },
  })
  const { errors } = formState

  const onSubmit = async (data) => {
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
        title={t("projectMeeting.sections.contactDetails.title")}
        description={t("projectMeeting.sections.contactDetails.description")}
      />
      <VStack align="stretch" spacing={4} maxW="md">
        <FormControl isRequired isInvalid={!!errors.contactName}>
          <FormLabel>{t("projectMeeting.contactName")}</FormLabel>
          <Input {...register("contactName", { required: t("projectMeeting.validation.contactNameRequired") })} />
          <FormErrorMessage>{errors.contactName?.message as string}</FormErrorMessage>
        </FormControl>
        <FormControl isRequired isInvalid={!!errors.contactEmail}>
          <FormLabel>{t("projectMeeting.contactEmail")}</FormLabel>
          <Input
            type="email"
            {...register("contactEmail", {
              required: t("projectMeeting.validation.contactEmailRequired"),
            })}
          />
          <FormErrorMessage>{errors.contactEmail?.message as string}</FormErrorMessage>
        </FormControl>
        <FormControl>
          <FormLabel>{t("projectMeeting.contactPhoneNumber")}</FormLabel>
          <Input {...register("contactPhoneNumber")} />
        </FormControl>
      </VStack>
      <FormActions isSubmitting={formState.isSubmitting} />
    </form>
  )
})

const DiscussionSection = observer(({ meeting }: { meeting: IProjectMeeting }) => {
  const { t } = useTranslation()
  const { permitProjectId } = useParams<{ permitProjectId: string }>()
  const { projectMeetingStore, uiStore } = useMst()
  const { navigateToNext } = useProjectMeetingNavigation()
  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      projectDescription: meeting.projectDescription || "",
      meetingNotes: meeting.meetingNotes || "",
    },
  })
  const { errors } = formState

  const onSubmit = async (data) => {
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
        title={t("projectMeeting.sections.discussion.title")}
        description={t("projectMeeting.sections.discussion.description")}
      />
      <VStack align="stretch" spacing={8} maxW="xl">
        <FormControl isRequired isInvalid={!!errors.projectDescription}>
          <FormLabel>{t("projectMeeting.projectDescription")}</FormLabel>
          <Textarea
            minH="120px"
            {...register("projectDescription", {
              required: t("projectMeeting.validation.projectDescriptionRequired"),
            })}
          />
          <Text fontSize="sm" color="text.secondary" mt={1}>
            {t("projectMeeting.projectDescriptionHint")}
          </Text>
          <FormErrorMessage>{errors.projectDescription?.message as string}</FormErrorMessage>
        </FormControl>
        <FormControl>
          <FormLabel>{t("projectMeeting.meetingNotes")}</FormLabel>
          <Textarea minH="120px" {...register("meetingNotes")} />
          <Text fontSize="sm" color="text.secondary" mt={1}>
            {t("projectMeeting.meetingNotesHint")}
          </Text>
        </FormControl>
      </VStack>
      <FormActions isSubmitting={formState.isSubmitting} />
    </form>
  )
})

const AuthorizationDocumentsSection = observer(({ meeting }: { meeting: IProjectMeeting }) => {
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

  const renderAuthorizationResources = () => (
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
  )

  const renderDocumentsTable = (documentsToRender: MeetingRequestDocumentFormValue[]) => {
    if (documentsToRender.length === 0) return null

    return (
      <TableContainer mb={6}>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>{t("projectMeeting.fileName")}</Th>
              <Th>{t("ui.actions")}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {documentsToRender.map((doc) => {
              const documentId = doc.id || doc.file?.id || doc.file?.metadata?.filename

              return (
                <Tr key={documentId}>
                  <Td>
                    {doc.id ? (
                      <FileDownloadButton
                        document={doc as IMeetingRequestDocument}
                        modelType={EFileUploadAttachmentType.MeetingRequestDocument}
                      />
                    ) : (
                      doc.file?.metadata?.filename
                    )}
                  </Td>
                  <Td>
                    <Button size="sm" variant="link" onClick={() => documentId && handleRemoveFile(documentId)}>
                      {t("ui.remove")}
                    </Button>
                  </Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </TableContainer>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SectionHeading
        title={t("projectMeeting.sections.documents.authorizationTitle")}
        description={t("projectMeeting.sections.documents.authorizationDescription")}
      />
      {renderAuthorizationResources()}
      <FormControl isRequired isInvalid={!!documentError} mb={8}>
        {renderDocumentsTable(authorizationDocuments)}
        <Box
          position="relative"
          w="100%"
          mb={2}
          sx={{
            ".uppy-Dashboard": { width: "100%" },
            ".uppy-Container": { width: "100%" },
            ".uppy-Dashboard-inner": { width: "100%" },
            ".uppy-Dashboard-innerWrap": { width: "100%" },
            ".uppy-Dashboard-AddFiles": { width: "100%" },
          }}
        >
          <Dashboard uppy={authorizationUppy} width="100%" height={220} proudlyDisplayPoweredByUppy={false} />
        </Box>
        <Text fontSize="sm" color="text.secondary" mt={2}>
          {t("projectMeeting.sections.documents.acceptedFormats")}
        </Text>
        <FormErrorMessage>{documentError}</FormErrorMessage>
      </FormControl>
      <FormActions isSubmitting={formState.isSubmitting} />
    </form>
  )
})

const DocumentsSection = observer(({ meeting }: { meeting: IProjectMeeting }) => {
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
  const supportingDocuments = activeDocumentsForType(documents, EMeetingRequestDocumentType.supporting)

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

  const supportingDocumentsUppy = useUppyS3({
    onUploadSuccess: handleUploadSuccess,
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
    const response = await projectMeetingStore.updateProjectMeeting(permitProjectId, meeting.id, data)
    if (response.ok) {
      navigateToNext()
    } else {
      uiStore.flashMessage.show(EFlashMessageStatus.error, null, t("projectMeeting.validation.saveError"), 5000)
    }
  }

  const renderDocumentsTable = (documentsToRender: MeetingRequestDocumentFormValue[]) => {
    if (documentsToRender.length === 0) return null

    return (
      <TableContainer mb={6}>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>{t("projectMeeting.fileName")}</Th>
              <Th>{t("ui.actions")}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {documentsToRender.map((doc) => {
              const documentId = doc.id || doc.file?.id || doc.file?.metadata?.filename

              return (
                <Tr key={documentId}>
                  <Td>
                    {doc.id ? (
                      <FileDownloadButton
                        document={doc as IMeetingRequestDocument}
                        modelType={EFileUploadAttachmentType.MeetingRequestDocument}
                      />
                    ) : (
                      doc.file?.metadata?.filename
                    )}
                  </Td>
                  <Td>
                    <Button size="sm" variant="link" onClick={() => documentId && handleRemoveFile(documentId)}>
                      {t("ui.remove")}
                    </Button>
                  </Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </TableContainer>
    )
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
      {renderDocumentsTable(supportingDocuments)}
      <Box
        position="relative"
        w="100%"
        mb={6}
        sx={{
          ".uppy-Dashboard": {
            width: "100%",
          },
          ".uppy-Container": {
            width: "100%",
          },
          ".uppy-Dashboard-inner": {
            width: "100%",
          },
          ".uppy-Dashboard-innerWrap": {
            width: "100%",
          },
          ".uppy-Dashboard-AddFiles": {
            width: "100%",
          },
        }}
      >
        <Dashboard uppy={supportingDocumentsUppy} width="100%" height={220} proudlyDisplayPoweredByUppy={false} />
      </Box>
      <Text fontSize="sm" color="text.secondary" mt={2}>
        {t("projectMeeting.sections.documents.acceptedFormats")}
      </Text>
      <FormActions isSubmitting={formState.isSubmitting} />
    </form>
  )
})

const PropertyInformationSection = observer(({ meeting }: { meeting: IProjectMeeting }) => {
  const { t } = useTranslation()
  const { permitProjectId } = useParams<{ permitProjectId: string }>()
  const { projectMeetingStore, uiStore } = useMst()
  const { navigateToNext } = useProjectMeetingNavigation()
  const { control, handleSubmit, formState } = useForm({
    defaultValues: {
      requestPropertyInformation:
        meeting.requestPropertyInformation === null ? "" : String(meeting.requestPropertyInformation),
    },
  })
  const propertyInformationError = formState.errors.requestPropertyInformation

  const onSubmit = async (data) => {
    const response = await projectMeetingStore.updateProjectMeeting(permitProjectId, meeting.id, {
      requestPropertyInformation: data.requestPropertyInformation === "true",
    })
    if (response.ok) {
      navigateToNext()
    } else {
      uiStore.flashMessage.show(EFlashMessageStatus.error, null, t("projectMeeting.validation.saveError"), 5000)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SectionHeading
        title={t("projectMeeting.sections.propertyInformation.title")}
        description={t("projectMeeting.sections.propertyInformation.description")}
      />
      <FormControl isRequired isInvalid={!!propertyInformationError}>
        <Controller
          name="requestPropertyInformation"
          control={control}
          rules={{ required: t("projectMeeting.validation.propertyInformationRequired") }}
          render={({ field }) => (
            <RadioGroup value={field.value} onChange={field.onChange}>
              <HStack spacing={3}>
                <Radio value="true">{t("ui.yes")}</Radio>
                <Radio value="false">{t("ui.no")}</Radio>
              </HStack>
            </RadioGroup>
          )}
        />
        <FormErrorMessage>{propertyInformationError?.message as string}</FormErrorMessage>
      </FormControl>
      <FormActions isSubmitting={formState.isSubmitting} />
    </form>
  )
})

const ReviewSection = observer(({ meeting }: { meeting: IProjectMeeting }) => {
  const { t } = useTranslation()
  const { currentPermitProject } = usePermitProject()
  const { permitProjectId } = useParams<{ permitProjectId: string }>()
  const { projectMeetingStore, uiStore } = useMst()
  const { navigateToSection } = useProjectMeetingNavigation()
  const navigate = useNavigate()
  const authorizationDocuments = activeDocumentsForType(
    [...meeting.meetingRequestDocuments],
    EMeetingRequestDocumentType.authorization
  )
  const supportingDocuments = activeDocumentsForType(
    [...meeting.meetingRequestDocuments],
    EMeetingRequestDocumentType.supporting
  )
  const isAuthorizationRequired =
    !!meeting.requesterRelationship &&
    meeting.requesterRelationship !== EProjectMeetingRequesterRelationship.ownerOrLandholder

  const submit = async () => {
    const response = await projectMeetingStore.submitProjectMeeting(permitProjectId, meeting.id)
    if (response.ok) {
      navigate(`/projects/${permitProjectId}/meetings/${meeting.id}/sent`)
    } else {
      uiStore.flashMessage.show(EFlashMessageStatus.error, null, t("projectMeeting.validation.submitError"), 5000)
    }
  }

  const SummarySection = ({ title, sectionKey, children }: SummarySectionProps) => (
    <Box mb={8}>
      <Heading as="h2" size="lg" variant="yellowline" mb={4}>
        {title}
      </Heading>
      {children}
      <Link as="button" type="button" color="text.link" mt={2} onClick={() => navigateToSection(sectionKey)}>
        {t("ui.change")}
      </Link>
    </Box>
  )

  return (
    <Box>
      <SectionHeading title={t("projectMeeting.sections.review.title")} />
      <SummarySection title={t("projectMeeting.projectInformation")} sectionKey="projectInformation">
        <ProjectInfoRow label={t("permitProject.overview.address")} value={currentPermitProject?.fullAddress} />
        <ProjectInfoRow label={t("permitProject.overview.pid")} value={currentPermitProject?.pid} />
        <ProjectInfoRow
          label={t("permitProject.overview.jurisdictionName")}
          value={currentPermitProject?.jurisdiction?.disambiguatedName}
        />
      </SummarySection>
      <SummarySection title={t("projectMeeting.sections.relationship.title")} sectionKey="relationship">
        <Text>
          {meeting.requesterRelationship && t(`projectMeeting.relationships.${meeting.requesterRelationship}`)}
        </Text>
      </SummarySection>
      <SummarySection title={t("projectMeeting.sections.discussion.title")} sectionKey="discussion">
        <ProjectInfoRow label={t("projectMeeting.projectDescription")} value={meeting.projectDescription} />
        <ProjectInfoRow label={t("projectMeeting.meetingNotes")} value={meeting.meetingNotes || t("ui.notProvided")} />
      </SummarySection>
      {isAuthorizationRequired && (
        <SummarySection
          title={t("projectMeeting.sections.documents.authorizationTitle")}
          sectionKey="authorizationDocuments"
        >
          {authorizationDocuments.length > 0 ? (
            authorizationDocuments.map((doc) => (
              <Text key={doc.id || doc.file?.id}>{doc.file?.metadata?.filename}</Text>
            ))
          ) : (
            <Text>{t("ui.notProvided")}</Text>
          )}
        </SummarySection>
      )}
      <SummarySection title={t("projectMeeting.sections.documents.title")} sectionKey="documents">
        {supportingDocuments.length > 0 ? (
          supportingDocuments.map((doc) => <Text key={doc.id || doc.file?.id}>{doc.file?.metadata?.filename}</Text>)
        ) : (
          <Text>{t("ui.notProvided")}</Text>
        )}
      </SummarySection>
      <SummarySection title={t("projectMeeting.sections.contactDetails.title")} sectionKey="contactDetails">
        <ProjectInfoRow label={t("projectMeeting.contactName")} value={meeting.contactName} />
        <ProjectInfoRow label={t("projectMeeting.contactEmail")} value={meeting.contactEmail} />
        <ProjectInfoRow
          label={t("projectMeeting.contactPhoneNumber")}
          value={meeting.contactPhoneNumber || t("ui.notProvided")}
        />
      </SummarySection>
      <SummarySection title={t("projectMeeting.sections.propertyInformation.title")} sectionKey="propertyInformation">
        <Text>{meeting.requestPropertyInformation ? t("ui.yes") : t("ui.no")}</Text>
      </SummarySection>
      <Box mb={8}>
        <Heading as="h2" size="lg" variant="yellowline" mb={4}>
          {t("projectMeeting.sendRequest")}
        </Heading>
        <Text mb={4}>{t("projectMeeting.sendRequestDescription")}</Text>
        <Button variant="primary" onClick={submit} isDisabled={!meeting.isReadyForSubmission}>
          {t("projectMeeting.acceptAndSend")}
        </Button>
      </Box>
    </Box>
  )
})

export const ProjectMeetingScreen = observer(() => {
  const { t } = useTranslation()
  const { section } = useParams<{ section: string }>()
  const { currentPermitProject, error: projectError } = usePermitProject()
  const { currentProjectMeeting, isLoading, error: meetingError } = useProjectMeeting()
  const { siteConfigurationStore } = useMst()

  if (projectError || meetingError) return <ErrorScreen />
  if (isLoading || !currentProjectMeeting || !currentPermitProject) return <LoadingScreen />
  if (
    !currentPermitProject.isOwner ||
    !siteConfigurationStore.projectMeetingsEnabled ||
    !currentPermitProject.jurisdiction?.projectMeetingsEnabled
  ) {
    return <ErrorScreen error={new Error(t("projectMeeting.validation.featureUnavailable"))} />
  }

  const renderSection = () => {
    switch (section) {
      case "project-information":
        return <ProjectInformationSection />
      case "relationship":
        return <RelationshipSection meeting={currentProjectMeeting} />
      case "authorization-documents":
        return currentProjectMeeting.authorizationRequired ? (
          <AuthorizationDocumentsSection meeting={currentProjectMeeting} />
        ) : (
          <ContactDetailsSection meeting={currentProjectMeeting} />
        )
      case "contact-details":
        return <ContactDetailsSection meeting={currentProjectMeeting} />
      case "discussion":
        return <DiscussionSection meeting={currentProjectMeeting} />
      case "documents":
        return <DocumentsSection meeting={currentProjectMeeting} />
      case "property-information":
        return <PropertyInformationSection meeting={currentProjectMeeting} />
      case "review":
        return <ReviewSection meeting={currentProjectMeeting} />
      default:
        return <ProjectInformationSection />
    }
  }

  return (
    <Container maxW="container.lg" p={8} as="main">
      <Button
        variant="link"
        as={RouterLink}
        to={`/projects/${currentPermitProject.id}/overview`}
        leftIcon={<CaretLeft size={20} />}
        mb={6}
      >
        {t("projectMeeting.backToProjectOverview")}
      </Button>
      {renderSection()}
    </Container>
  )
})
