import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  IconButton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react"
import { ArrowCounterClockwise, Trash } from "@phosphor-icons/react"
import { UppyFile } from "@uppy/core"
import "@uppy/core/dist/style.min.css"
import "@uppy/dashboard/dist/style.css"
import Dashboard from "@uppy/react/lib/Dashboard.js"
import { observer } from "mobx-react-lite"
import React, { useEffect, useRef } from "react"
import { FormProvider, useFieldArray, useForm } from "react-hook-form"
import { usePermitProject } from "../../../hooks/resources/use-permit-project"
import useUppyS3 from "../../../hooks/use-uppy-s3"
import { IPermitApplication } from "../../../models/permit-application" // Assuming path to your model
import { useMst } from "../../../setup/root" // Needed for store access
import { EFileUploadAttachmentType } from "../../../types/enums" // Import enum
import { IProjectDocument } from "../../../types/types"
import { ErrorScreen } from "../../shared/base/error-screen"
import { FileDownloadButton } from "../../shared/base/file-download-button" // Import the new button
import { LoadingScreen } from "../../shared/base/loading-screen"
import { PermitApplicationCard } from "../../shared/permit-applications/permit-application-card" // Import the card component
import { ProjectReadinessTabContent } from "./project-readiness-tab-content"

interface IProjectDocumentFormInput extends Omit<IProjectDocument, "createdAt" | "file" | "id"> {
  id?: string
  // file_data was used for react-hook-form state, but the actual model and API use `file`
  file?: IProjectDocument["file"] // Changed from file_data to file to match model
  _destroy?: boolean
}

interface IProjectForm {
  description: string // Assuming description might be editable too
  projectDocumentsAttributes: IProjectDocumentFormInput[]
}

export const PermitProjectScreen = observer(() => {
  const { currentPermitProject, error } = usePermitProject()
  const { permitProjectStore } = useMst()
  const toast = useToast()

  // Create a ref to hold the current project ID
  const currentPermitProjectIdRef = useRef<string | null>(null)

  // Keep the ref updated with the latest project ID
  useEffect(() => {
    currentPermitProjectIdRef.current = currentPermitProject?.id || null
  }, [currentPermitProject])

  const methods = useForm<IProjectForm>({
    defaultValues: {
      description: "",
      projectDocumentsAttributes: [],
    },
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "projectDocumentsAttributes",
    keyName: "rhfId",
  })

  useEffect(() => {
    if (currentPermitProject) {
      reset({
        description: currentPermitProject.description || "",
        projectDocumentsAttributes:
          currentPermitProject.projectDocuments?.map((doc) => ({
            id: doc.id,
            permitProjectId: currentPermitProject.id,
            file: doc.file,
            createdAt: doc.createdAt,
            _destroy: false,
          })) || [],
      })
    }
  }, [currentPermitProject, reset])

  const handleUploadSuccess = (file: UppyFile<{}, {}>, response: any) => {
    const projectId = currentPermitProjectIdRef.current // Access the ID from the ref

    const parts = response.uploadURL.split("/")
    const key = parts[parts.length - 1]
    append({
      permitProjectId: projectId, // Use the ID from the ref
      file: {
        id: key,
        storage: "cache",
        metadata: { size: file.size || 0, filename: file.name, mimeType: file.type || "application/octet-stream" },
      },
      _destroy: false,
    })
  }

  const uppy = useUppyS3({ onUploadSuccess: handleUploadSuccess, maxNumberOfFiles: 10, autoProceed: true })

  const onSubmit = async (data: IProjectForm) => {
    const storeActionParams: {
      description?: string
      projectDocuments?: Array<Partial<IProjectDocument> & { _destroy?: boolean; permitProjectId?: string }>
    } = {
      description: data.description,
      projectDocuments: data.projectDocumentsAttributes.map((docAttr) => {
        const existingDoc = currentPermitProject?.projectDocuments?.find((d) => d.id === docAttr.id)
        return {
          id: docAttr.id,
          permitProjectId: docAttr.permitProjectId,
          file: docAttr.file || existingDoc?.file,
          createdAt: existingDoc?.createdAt,
          _destroy: docAttr._destroy,
        }
      }),
    }

    const result = await permitProjectStore.updateCurrentPermitProject(storeActionParams)
    if (result.ok) {
      toast({ title: "Project updated successfully!", status: "success" })
    } else {
      toast({
        title: "Error updating project",
        description: result.data?.error || "Please try again.",
        status: "error",
      })
    }
  }

  if (error) return <ErrorScreen error={error} />
  if (!currentPermitProject && !error) return <LoadingScreen />
  if (!currentPermitProject) return <Text>Permit project not found.</Text>

  const permitApplications = currentPermitProject.permitApplications || []

  return (
    <FormProvider {...methods}>
      <Box p={5} as="form" onSubmit={handleSubmit(onSubmit)}>
        <Heading as="h1" size="xl" mb={6}>
          Permit Project Details
        </Heading>
        <Box borderWidth="1px" borderRadius="lg" p={6} mb={6}>
          <Heading as="h3" size="md" mb={3}>
            ID: {currentPermitProject.id}
          </Heading>
          {/* Description could be made editable with RHF if needed */}
          <Text mb={3}>
            <strong>Description:</strong> {currentPermitProject.description}
          </Text>
        </Box>

        <Tabs variant="enclosed-colored" isLazy>
          <TabList>
            <Tab>Permit Applications</Tab>
            <Tab>Documents</Tab>
            <Tab>Project Readiness</Tab>
          </TabList>
          <TabPanels>
            <TabPanel p={{ base: 0, md: 4 }}>
              {permitApplications.length > 0 ? (
                <VStack spacing={6} align="stretch">
                  {permitApplications.map((app: IPermitApplication) => (
                    <PermitApplicationCard key={app.id} permitApplication={app} />
                  ))}
                </VStack>
              ) : (
                <Text p={4}>No permit applications associated with this project.</Text>
              )}
            </TabPanel>
            <TabPanel p={4}>
              <Heading as="h3" size="md" mb={3}>
                Project Documents
              </Heading>
              <FormControl mb={4}>
                <FormLabel>Upload New Documents</FormLabel>
                <Dashboard uppy={uppy} height={200} />
              </FormControl>

              {fields.length > 0 && (
                <VStack spacing={2} align="start" mb={4}>
                  <Text fontWeight="bold">Uploaded Documents:</Text>
                  {fields.map((field, index) => {
                    const isNewUnsavedDocument = !field.id
                    const existingDoc = currentPermitProject?.projectDocuments?.find((d) => d.id === field.id)

                    const displayDoc = {
                      id: field.id,
                      file: field.file,
                      createdAt: existingDoc?.createdAt,
                      _destroy: field._destroy,
                      permitProjectId: field.permitProjectId || currentPermitProject.id,
                    } as Partial<IProjectDocument>

                    if (!displayDoc.file) return null

                    return (
                      <Flex
                        key={field.rhfId}
                        w="full"
                        justify="space-between"
                        align="center"
                        opacity={field._destroy ? 0.5 : 1}
                      >
                        <FileDownloadButton
                          document={displayDoc as IProjectDocument}
                          modelType={EFileUploadAttachmentType.ProjectDocument}
                          isDisabled={isNewUnsavedDocument || field._destroy}
                          title={isNewUnsavedDocument ? "Save project to enable download" : "Download file"}
                        />
                        {field._destroy ? (
                          <Button
                            size="sm"
                            variant="link"
                            colorScheme="green"
                            leftIcon={<Icon as={ArrowCounterClockwise} />}
                            onClick={() => update(index, { ...field, _destroy: false })}
                          >
                            Undo Remove
                          </Button>
                        ) : (
                          <IconButton
                            aria-label="Remove document"
                            icon={<Icon as={Trash} />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => update(index, { ...field, _destroy: true })}
                          />
                        )}
                      </Flex>
                    )
                  })}
                </VStack>
              )}
              {fields.length === 0 && !currentPermitProject.projectDocuments?.length && (
                <Text>No documents uploaded to this project yet.</Text>
              )}
            </TabPanel>
            <TabPanel p={4}>
              <ProjectReadinessTabContent />
            </TabPanel>
          </TabPanels>
        </Tabs>
        <Button mt={6} colorScheme="blue" type="submit" isLoading={isSubmitting} isDisabled={isSubmitting}>
          Save Project Changes
        </Button>
      </Box>
    </FormProvider>
  )
})
