import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
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
import { CaretLeft, Download, Link as LinkIcon, Pencil, Plus, Trash } from "@phosphor-icons/react"
import { UppyFile } from "@uppy/core"
import "@uppy/core/dist/style.min.css"
import "@uppy/dashboard/dist/style.css"
import Dashboard from "@uppy/react/lib/Dashboard.js"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useEffect, useRef, useState } from "react"
import { FormProvider, useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useJurisdiction } from "../../../../../hooks/resources/use-jurisdiction"
import useUppyS3 from "../../../../../hooks/use-uppy-s3"
import { EResourceCategory, EResourceType } from "../../../../../types/enums"
import { IResource } from "../../../../../types/types"
import { BlueTitleBar } from "../../../../shared/base/blue-title-bar"
import { ErrorScreen } from "../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../shared/base/loading-screen"
import {
  SelectFormControl,
  TextAreaFormControl,
  TextFormControl,
  UrlFormControl,
} from "../../../../shared/form/input-form-control"

interface IResourcesForm {
  resourcesAttributes: Array<{
    id?: string
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
    _destroy?: boolean
  }>
}

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
  const containerRef = useRef<HTMLDivElement>(null)
  const modalContainerRef = useRef<HTMLDivElement>(null)

  const getDefaultValues = (): IResourcesForm => {
    return {
      resourcesAttributes:
        currentJurisdiction?.resources?.map((resource) => ({
          id: resource.id,
          category: resource.category,
          title: resource.title,
          description: resource.description,
          resourceType: resource.resourceType,
          linkUrl: resource.linkUrl,
          resourceDocumentAttributes: resource.resourceDocument
            ? {
                id: resource.resourceDocument.id,
                file: resource.resourceDocument.file,
              }
            : undefined,
        })) || [],
    }
  }

  const formMethods = useForm<IResourcesForm>({
    mode: "onChange",
    defaultValues: getDefaultValues(),
  })

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

  const { control, watch, reset, handleSubmit } = formMethods
  const {
    control: modalControl,
    watch: modalWatch,
    reset: modalReset,
    handleSubmit: modalHandleSubmit,
    setValue: modalSetValue,
  } = modalFormMethods

  const resourcesAttributes = watch("resourcesAttributes")
  const resourceType = modalWatch("resourceType")

  const { append, update, remove } = useFieldArray({
    control,
    name: "resourcesAttributes",
  })

  useEffect(() => {
    if (currentJurisdiction) {
      reset(getDefaultValues())
    }
  }, [currentJurisdiction?.id])

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

    if (editingResource) {
      const index = resourcesAttributes.findIndex((r) => r.id === editingResource.id)
      if (index !== -1) {
        update(index, {
          id: editingResource.id,
          category: formData.category,
          title: formData.title,
          description: formData.description,
          resourceType: formData.resourceType,
          linkUrl: formData.linkUrl,
          resourceDocumentAttributes: formData.resourceDocumentAttributes,
        })
      }
    } else {
      append({
        category: formData.category,
        title: formData.title,
        description: formData.description,
        resourceType: formData.resourceType,
        linkUrl: formData.linkUrl,
        resourceDocumentAttributes: formData.resourceDocumentAttributes,
      })
    }
    handleCloseModal()
  }

  const handleRemoveResource = (resourceId: string) => {
    const index = resourcesAttributes.findIndex((r) => r.id === resourceId)
    if (index !== -1) {
      const resource = resourcesAttributes[index]
      update(index, { ...resource, _destroy: true })
    }
  }

  const handleUndoRemove = (resourceId: string) => {
    const index = resourcesAttributes.findIndex((r) => r.id === resourceId)
    if (index !== -1) {
      const resource = resourcesAttributes[index]
      update(index, { ...resource, _destroy: false })
    }
  }

  const onSubmit = async (formData: IResourcesForm) => {
    if (currentJurisdiction) {
      await currentJurisdiction.update({
        resourcesAttributes: formData.resourcesAttributes,
      })
    }
  }

  const getResourcesByCategory = (category: string) => {
    return resourcesAttributes.filter((r) => r.category === category && !r._destroy)
  }

  const categoryLabels = {
    [EResourceCategory.planningZoning]: t("home.configurationManagement.resources.categories.planningZoning"),
    [EResourceCategory.bylawsRequirements]: t("home.configurationManagement.resources.categories.bylawsRequirements"),
    [EResourceCategory.additionalResources]: t("home.configurationManagement.resources.categories.additionalResources"),
  }

  if (error) return <ErrorScreen error={error} />
  if (!currentJurisdiction) return <LoadingScreen />

  return (
    <Flex as="main" direction="column" w="full" bg="greys.white" pb="24">
      <BlueTitleBar title={currentJurisdiction.qualifiedName} />
      <Container maxW="container.lg" py={{ base: 6, md: 16 }} px={8}>
        <VStack spacing={8} align="start" w="full">
          <Button variant="link" onClick={() => navigate(-1)} leftIcon={<CaretLeft size={20} />} textDecoration="none">
            {t("ui.back")}
          </Button>
          <Flex align="center" w="100%" direction="column" alignItems="flex-start">
            <Text as="h1" fontSize="3xl" fontWeight="bold" mb={0}>
              {t("home.configurationManagement.resources.title")}
            </Text>
            <Text color="text.secondary" fontSize="lg" mt={2}>
              {t("home.configurationManagement.resources.description")}
            </Text>
          </Flex>

          <FormProvider {...formMethods}>
            <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
              <VStack spacing={6} align="stretch" w="full">
                <Flex justify="flex-end" w="full">
                  <Button variant="primary" leftIcon={<Plus size={20} />} onClick={() => handleOpenModal()}>
                    {t("home.configurationManagement.resources.addResource")}
                  </Button>
                </Flex>

                {Object.values(EResourceCategory).map((category) => {
                  const categoryResources = getResourcesByCategory(category)
                  if (categoryResources.length === 0) return null

                  return (
                    <Box key={category} as="section" w="full" boxShadow="md" borderRadius="xl" bg="greys.grey10">
                      <Box as="header" w="full" px={6} py={3} bg="theme.blueAlt" borderTopRadius="xl">
                        <Heading as="h3" fontSize="xl" color="greys.white" fontWeight={700}>
                          {categoryLabels[category]}
                        </Heading>
                      </Box>
                      <VStack spacing={4} w="full" alignItems="stretch" px={6} pb={6} pt={4}>
                        {categoryResources.map((resource) => (
                          <Box
                            key={resource.id}
                            p={4}
                            bg="greys.white"
                            borderRadius="lg"
                            border="1px solid"
                            borderColor="border.base"
                            position="relative"
                          >
                            <Flex justifyContent="space-between" alignItems="flex-start" mb={2}>
                              <VStack align="start" spacing={1} flex={1}>
                                <HStack spacing={2}>
                                  <Text fontWeight="bold" fontSize="lg">
                                    {resource.title}
                                  </Text>
                                  <Tag
                                    size="sm"
                                    colorScheme={resource.resourceType === EResourceType.file ? "blue" : "green"}
                                    variant="subtle"
                                  >
                                    {resource.resourceType === EResourceType.file ? (
                                      <HStack spacing={1}>
                                        <Download size={14} />
                                        <Text>{t("home.configurationManagement.resources.types.pdf")}</Text>
                                      </HStack>
                                    ) : (
                                      <HStack spacing={1}>
                                        <LinkIcon size={14} />
                                        <Text>{t("home.configurationManagement.resources.types.linkTag")}</Text>
                                      </HStack>
                                    )}
                                  </Tag>
                                </HStack>
                                {resource.description && (
                                  <Text color="text.secondary" fontSize="sm">
                                    {resource.description}
                                  </Text>
                                )}
                                <Text color="text.secondary" fontSize="xs">
                                  {t("ui.updatedAt")}{" "}
                                  {(() => {
                                    const originalResource = currentJurisdiction.resources.find(
                                      (r) => r.id === resource.id
                                    )
                                    if (!originalResource) return ""
                                    const dateToFormat =
                                      originalResource.updatedAt ||
                                      originalResource.createdAt ||
                                      new Date().toISOString()
                                    return format(new Date(dateToFormat), "MMM d, yyyy")
                                  })()}
                                </Text>
                              </VStack>
                              <HStack spacing={2}>
                                <IconButton
                                  aria-label={t("ui.edit")}
                                  icon={<Icon as={Pencil} />}
                                  variant="tertiary"
                                  size="sm"
                                  onClick={() => {
                                    const fullResource = currentJurisdiction.resources.find((r) => r.id === resource.id)
                                    if (fullResource) handleOpenModal(fullResource)
                                  }}
                                />
                                <IconButton
                                  aria-label={t("ui.remove")}
                                  color="semantic.error"
                                  icon={<Icon as={Trash} />}
                                  variant="tertiary"
                                  size="sm"
                                  onClick={() => handleRemoveResource(resource.id!)}
                                />
                              </HStack>
                            </Flex>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  )
                })}

                <Flex justify="flex-end" w="full">
                  <Button type="submit" variant="primary" size="lg">
                    {t("ui.save")}
                  </Button>
                </Flex>
              </VStack>
            </form>
          </FormProvider>
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
                    label: categoryLabels[cat],
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
                      <Dashboard uppy={modalUppy} height={300} width="100%" />
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
              <Button variant="ghost" mr={3} onClick={handleCloseModal}>
                {t("ui.cancel")}
              </Button>
              <Button type="submit" variant="primary">
                {t("ui.add")}
              </Button>
            </ModalFooter>
          </ModalContent>
        </FormProvider>
      </Modal>
    </Flex>
  )
})
