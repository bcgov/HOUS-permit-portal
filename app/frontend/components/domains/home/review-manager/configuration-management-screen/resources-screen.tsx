import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Stack,
  Tag,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react"
import { CaretLeft, Link, Pencil, Plus, Trash, X } from "@phosphor-icons/react"
import { UppyFile } from "@uppy/core"
import "@uppy/core/dist/style.min.css"
import "@uppy/dashboard/dist/style.css"
import Dashboard from "@uppy/react/lib/Dashboard.js"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useJurisdiction } from "../../../../../hooks/resources/use-jurisdiction"
import useUppyS3 from "../../../../../hooks/use-uppy-s3"
import {
  EFileScanStatus,
  EFileUploadAttachmentType,
  EResourceCategory,
  EResourceType,
} from "../../../../../types/enums"
import { IResource } from "../../../../../types/types"
import { getFileTypeInfo } from "../../../../../utils/file-utils"
import { BlueTitleBar } from "../../../../shared/base/blue-title-bar"
import { ErrorScreen } from "../../../../shared/base/error-screen"
import { FileDownloadButton } from "../../../../shared/base/file-download-button"
import { LoadingScreen } from "../../../../shared/base/loading-screen"
import { ConfirmationModal } from "../../../../shared/confirmation-modal"
import { FileRemovedTag } from "../../../../shared/file-removed-tag"
import {
  SelectFormControl,
  TextAreaFormControl,
  TextFormControl,
  UrlFormControl,
} from "../../../../shared/form/input-form-control"

interface IResourceModalForm {
  category: string
  title: string
  description?: string
  resourceType: string
  linkUrl?: string
  resourceDocumentAttributes?: {
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
    _destroy?: boolean
  }
}

export const ResourcesScreen = observer(function ResourcesScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { currentJurisdiction, error } = useJurisdiction()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [editingResource, setEditingResource] = useState<IResource | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const modalContainerRef = useRef<HTMLDivElement>(null)

  const modalFormMethods = useForm<IResourceModalForm>({
    mode: "onChange",
    defaultValues: {
      category: EResourceCategory.additionalResources,
      resourceType: EResourceType.file,
      title: "",
      description: "",
      linkUrl: "",
    },
  })

  const {
    watch: modalWatch,
    reset: modalReset,
    handleSubmit: modalHandleSubmit,
    setValue: modalSetValue,
  } = modalFormMethods

  const resourceType = modalWatch("resourceType")

  const handleOpenModal = (resource?: IResource) => {
    // Reset Uppy whenever opening the modal to ensure a clean state
    modalUppy.cancelAll()
    // Clear all files from Uppy
    modalUppy.getFiles().forEach((file) => {
      modalUppy.removeFile(file.id)
    })

    if (resource) {
      setEditingResource(resource)
      modalReset({
        category: resource.category,
        title: resource.title,
        description: resource.description || "",
        resourceType: resource.resourceType,
        linkUrl: resource.linkUrl || "",
        resourceDocumentAttributes: resource.resourceDocument
          ? {
              id: resource.resourceDocument.id,
              file: resource.resourceDocument.file,
            }
          : undefined,
      })
    } else {
      setEditingResource(null)
      modalReset({
        category: EResourceCategory.additionalResources,
        resourceType: EResourceType.file,
        title: "",
        description: "",
        linkUrl: "",
      })
    }
    onOpen()
  }

  const handleCloseModal = () => {
    // Reset form to default values
    modalReset({
      category: EResourceCategory.additionalResources,
      resourceType: EResourceType.file,
      title: "",
      description: "",
      linkUrl: "",
    })

    // Reset Uppy instance - cancel any ongoing uploads and clear files
    modalUppy.cancelAll()
    // Clear all files from Uppy
    modalUppy.getFiles().forEach((file) => {
      modalUppy.removeFile(file.id)
    })

    // Clear editing resource and close modal
    setEditingResource(null)
    onClose()
  }

  const handleUploadSuccess = (file: UppyFile<{}, {}>, response: any) => {
    let key: string
    if (response.uploadURL) {
      const parts = response.uploadURL.split("/")
      key = parts[parts.length - 1]
    } else if (response.key) {
      key = response.key.split("/").pop() || file.id
    } else {
      key = file.id
    }
    modalSetValue("resourceDocumentAttributes", {
      file: {
        id: key,
        storage: "cache",
        metadata: {
          size: file.size || 0,
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
        },
      },
    })
  }

  const modalUppy = useUppyS3({
    onUploadSuccess: handleUploadSuccess,
    maxNumberOfFiles: 1,
    autoProceed: true,
  })

  const onModalSubmit = async (formData: IResourceModalForm) => {
    if (!currentJurisdiction) return

    setIsSubmitting(true)
    try {
      await currentJurisdiction.update({
        resourcesAttributes: [
          {
            id: editingResource?.id,
            category: formData.category,
            title: formData.title,
            description: formData.description,
            resourceType: formData.resourceType,
            linkUrl: formData.linkUrl,
            resourceDocumentAttributes: formData.resourceDocumentAttributes,
          },
        ],
      })
      handleCloseModal()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveResource = async (resource: IResource) => {
    if (!currentJurisdiction) return

    await currentJurisdiction.update({
      resourcesAttributes: [
        {
          id: resource.id,
          _destroy: true,
        },
      ],
    })
  }

  const getResourcesByCategory = (category: string) => {
    return currentJurisdiction?.resources?.filter((r) => r.category === category) || []
  }

  if (error) return <ErrorScreen error={error} />
  if (!currentJurisdiction) return <LoadingScreen />

  return (
    <Flex as="main" direction="column" w="full" bg="greys.white" pb="24">
      <BlueTitleBar title={currentJurisdiction.qualifiedName} />
      <Container maxW="container.lg" py={{ base: 6, md: 16 }} px={8}>
        <VStack spacing={4} align="start" w="full">
          <Button variant="link" onClick={() => navigate(-1)} leftIcon={<CaretLeft size={20} />} textDecoration="none">
            {t("ui.back")}
          </Button>
          <Flex justify="space-between" w="full">
            <Text as="h1" fontSize="3xl" fontWeight="bold" mb={0}>
              {t("home.configurationManagement.resources.title")}
            </Text>
            <Button variant="primary" leftIcon={<Plus size={20} />} onClick={() => handleOpenModal()}>
              {t("home.configurationManagement.resources.addResource")}
            </Button>
          </Flex>
          <Text color="text.secondary" fontSize="lg" mt={2}>
            {t("home.configurationManagement.resources.description")}
          </Text>
          <VStack spacing={6} align="stretch" w="full">
            {Object.values(EResourceCategory).map((category) => {
              const categoryResources = getResourcesByCategory(category)
              if (categoryResources.length === 0) return null

              return (
                <Box key={category} as="section" w="full">
                  <Heading as="h3" fontSize="lg" fontWeight={700} mb={3}>
                    {t(`jurisdiction.resources.categories.${category as EResourceCategory}`)}
                  </Heading>
                  <VStack spacing={4} w="full" alignItems="stretch">
                    {categoryResources.map((resource) => (
                      <ResourceInputCard
                        key={resource.id}
                        resource={resource}
                        onEdit={handleOpenModal}
                        onDelete={handleRemoveResource}
                      />
                    ))}
                  </VStack>
                </Box>
              )
            })}
          </VStack>
        </VStack>
      </Container>

      <Modal onClose={handleCloseModal} isOpen={isOpen} size="2xl">
        <ModalOverlay />
        <FormProvider {...modalFormMethods}>
          <ModalContent as="form" onSubmit={modalHandleSubmit(onModalSubmit)}>
            <ModalHeader>
              <ModalCloseButton />
              {editingResource
                ? t("home.configurationManagement.resources.editResource")
                : t("home.configurationManagement.resources.addResource")}
            </ModalHeader>
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <SelectFormControl
                  label={t("home.configurationManagement.resources.category")}
                  fieldName="category"
                  required
                  options={Object.values(EResourceCategory).map((cat) => ({
                    label: t(`jurisdiction.resources.categories.${cat}`),
                    value: cat,
                  }))}
                />

                <TextFormControl
                  label={t("home.configurationManagement.resources.titleLabel")}
                  fieldName="title"
                  required
                />

                <TextAreaFormControl
                  label={t("home.configurationManagement.resources.descriptionLabel")}
                  fieldName="description"
                />

                <FormControl>
                  <FormLabel>{t("home.configurationManagement.resources.resourceType")}</FormLabel>
                  <RadioGroup
                    value={resourceType}
                    onChange={(value) => {
                      modalSetValue("resourceType", value)
                      if (value === EResourceType.file) {
                        modalSetValue("linkUrl", "")
                      } else {
                        modalSetValue("resourceDocumentAttributes", undefined)
                      }
                    }}
                  >
                    <Stack direction="row" spacing={4}>
                      <Radio value={EResourceType.file}>{t("home.configurationManagement.resources.types.file")}</Radio>
                      <Radio value={EResourceType.link}>{t("home.configurationManagement.resources.types.link")}</Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>

                {resourceType === EResourceType.file ? (
                  <Box ref={modalContainerRef}>
                    <FormLabel>{t("home.configurationManagement.resources.file")}</FormLabel>
                    <Box position="relative" mt={2}>
                      <Dashboard uppy={modalUppy} height={300} width="100%" proudlyDisplayPoweredByUppy={false} />
                    </Box>
                  </Box>
                ) : (
                  <UrlFormControl
                    label={t("home.configurationManagement.resources.linkUrl")}
                    fieldName="linkUrl"
                    required
                  />
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={handleCloseModal} isDisabled={isSubmitting}>
                {t("ui.cancel")}
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                {t("ui.save")}
              </Button>
            </ModalFooter>
          </ModalContent>
        </FormProvider>
      </Modal>
    </Flex>
  )
})

interface IResourceInputCardProps {
  resource: IResource
  onEdit: (resource: IResource) => void
  onDelete: (resource: IResource) => void
}

const ResourceInputCard: React.FC<IResourceInputCardProps> = ({ resource, onEdit, onDelete }) => {
  const { t } = useTranslation()

  const dateToFormat = resource.updatedAt || resource.createdAt || new Date().toISOString()
  const formattedDate = format(new Date(dateToFormat), "yyyy-MM-dd HH:mm")

  // Determine the file type info based on mime type or resource type
  const fileTypeInfo =
    resource.resourceType === EResourceType.link
      ? { icon: <Link />, label: "LINK" }
      : getFileTypeInfo(resource.resourceDocument?.file?.metadata?.mimeType)

  const isInfected =
    resource.resourceType === EResourceType.file && resource.resourceDocument?.scanStatus === EFileScanStatus.infected

  return (
    <Box p={4} bg={"greys.grey04"} borderRadius="lg" position="relative">
      <Flex gap={4} justify="space-between" alignItems="flex-start">
        {/* Content */}
        <VStack align="start" spacing={2} flex={1}>
          <Text fontWeight="bold" fontSize="md">
            {resource.title}
          </Text>

          <Flex align="center" gap={2}>
            {isInfected ? (
              <FileRemovedTag />
            ) : (
              <Tag backgroundColor="semantic.infoLight" size="sm" fontWeight="medium" color="text.secondary">
                <Flex align="center" gap={1}>
                  {fileTypeInfo.icon}
                  <Text as="span">{fileTypeInfo.label}</Text>
                </Flex>
              </Tag>
            )}

            {resource.resourceType === EResourceType.file &&
              resource.resourceDocument?.file?.metadata?.filename &&
              (isInfected ? (
                <Text fontSize="sm" color="text.primary" noOfLines={1}>
                  {resource.resourceDocument.file.metadata.filename}
                </Text>
              ) : (
                <FileDownloadButton
                  document={resource.resourceDocument}
                  modelType={EFileUploadAttachmentType.ResourceDocument}
                />
              ))}
            {resource.resourceType === EResourceType.link && resource.linkUrl && (
              <Text fontSize="sm" color="text.primary" noOfLines={1}>
                {resource.linkUrl}
              </Text>
            )}
          </Flex>

          {isInfected && (
            <Text color="text.primary" fontSize="sm">
              {t("resource.fileRemovedDescription")}
            </Text>
          )}

          {!isInfected && resource.description && (
            <Text color="text.secondary" fontSize="sm">
              {resource.description}
            </Text>
          )}
          <Text color="text.secondary" fontSize="xs">
            {t("ui.uploaded")} {formattedDate}
          </Text>
        </VStack>

        {/* Actions */}
        <Flex direction="column" align="flex-end" gap={2} flexShrink={0}>
          {isInfected ? (
            <Button variant="ghost" onClick={() => onDelete(resource)} leftIcon={<X />} size="sm">
              {t("ui.dismiss")}
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => onEdit(resource)} leftIcon={<Pencil />}>
                {t("ui.edit")}
              </Button>
              <ConfirmationModal
                title={t("home.configurationManagement.resources.confirmDelete")}
                body={t("home.configurationManagement.resources.confirmDeleteBody")}
                onConfirm={async (closeModal) => {
                  await onDelete(resource)
                  closeModal()
                }}
                renderTriggerButton={(props) => (
                  <Button {...props} variant="tertiary" px={0} leftIcon={<Trash />}>
                    {t("ui.delete")}
                  </Button>
                )}
              />
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  )
}
