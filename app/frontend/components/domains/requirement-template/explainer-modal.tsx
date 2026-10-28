import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tag,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react"
import {
  closestCenter,
  defaultDropAnimationSideEffects,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { DotsSixVertical, Info, Plus, X } from "@phosphor-icons/react"
import { UppyFile } from "@uppy/core"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { CSSProperties, useEffect, useRef, useState } from "react"
import { Controller, FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form"
import { useTranslation } from "react-i18next"
import Select, { GroupBase } from "react-select"
import { datefnsTableDateTimeFormat } from "../../../constants"
import useUppyS3 from "../../../hooks/use-uppy-s3"
import { IExplainer } from "../../../models/explainer"
import { IJurisdictionExplainer } from "../../../models/jurisdiction-explainer"
import { IRequirementTemplate } from "../../../models/requirement-template"
import { ITemplateVersion } from "../../../models/template-version"
import { IExplainerParams, IUppyAttachmentFile } from "../../../types/api-request"
import { EFileUploadAttachmentType } from "../../../types/enums"
import { IOption } from "../../../types/types"
import { groupFilterOptions, shouldShowFilterGroupLabels } from "../../../utils/group-filter-options"
import { isTipTapEmpty } from "../../../utils/utility-functions"
import { CalloutBanner } from "../../shared/base/callout-banner"
import { FileDownloadButton } from "../../shared/base/file-download-button"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { ConfirmationModal } from "../../shared/confirmation-modal"
import { Editor } from "../../shared/editor/editor"
import { TextAreaFormControl, TextFormControl, UrlFormControl } from "../../shared/form/input-form-control"
import { SortableItem } from "../../shared/sortable-item"
import { UppyDashboard } from "../../shared/uppy-dashboard"
import { FromYourLocalJurisdiction } from "./from-your-local-jurisdiction"
import { LocalContextEditor } from "./local-context-editor"

interface IDocumentFormValue {
  id?: string
  _destroy?: boolean
  file?: IUppyAttachmentFile
  uppyFileId?: string
  fileName?: string | null
}

interface IFormValues {
  introductionHtml: string
  beforeYouApplyHtml: string
  steps: { title: string; description: string }[]
  links: { title: string; url: string }[]
  documentsAttributes: IDocumentFormValue[]
  relatedTemplateIds: string[]
  isPublished: boolean
  localContextHtml: string
}

// Same as note attachments: last path segment of the cache URL is the Shrine file id.
const extractUploadedFileKey = (file: UppyFile<{}, {}>, response: any) => {
  const source = response?.uploadURL || response?.location || response?.key || ""
  const key = source.split("?")[0].split("/").pop()

  return key || file.name || file.id
}

const documentsAttributesForSave = (documents: IDocumentFormValue[]): IExplainerParams["documentsAttributes"] =>
  documents.flatMap((document) => {
    if (document._destroy) return document.id ? [{ id: document.id, _destroy: true }] : []
    if (document.id) return [{ id: document.id }]
    if (document.file) return [{ file: document.file }]
    return []
  })

const stepDragModifiers = [restrictToVerticalAxis, restrictToParentElement]

const stepDropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0.35" } },
  }),
}

const emptyForm: IFormValues = {
  introductionHtml: "",
  beforeYouApplyHtml: "",
  steps: [],
  links: [],
  documentsAttributes: [],
  relatedTemplateIds: [],
  isPublished: false,
  localContextHtml: "",
}

function scrollWithinModalBody(el: HTMLElement | null) {
  if (!el) return
  const body = el.closest(".chakra-modal__body") as HTMLElement | null
  if (!body) return
  const paddingTop = Number.parseFloat(getComputedStyle(body).paddingTop) || 0
  const top = el.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - paddingTop
  body.scrollTo({ top: Math.max(0, top), behavior: "smooth" })
}

export const ExplainerModal = observer(function ExplainerModal({
  requirementTemplate,
  templateVersion,
  jurisdictionId,
  mode = "superAdmin",
  isOpen,
  onClose,
  onLocalContextSaved,
}: {
  requirementTemplate?: IRequirementTemplate
  templateVersion?: ITemplateVersion
  jurisdictionId?: string
  mode?: "superAdmin" | "reviewManager"
  isOpen: boolean
  onClose: () => void
  onLocalContextSaved?: (html: string) => void
}) {
  const { t } = useTranslation()
  const closeConfirm = useDisclosure()
  const localSectionRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [options, setOptions] = useState<IOption[]>([])
  const [activeStepId, setActiveStepId] = useState<string | null>(null)
  const [savedExplainer, setSavedExplainer] = useState<IExplainer | null>(null)
  const [jurisdictionExplainers, setJurisdictionExplainers] = useState<IJurisdictionExplainer[]>([])
  const [localUpdatedAt, setLocalUpdatedAt] = useState<string | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const isReviewManager = mode === "reviewManager"
  const explainer = requirementTemplate?.explainer ?? savedExplainer
  const nickname =
    requirementTemplate?.nickname || templateVersion?.denormalizedTemplateJson?.nickname || templateVersion?.label

  const methods = useForm<IFormValues>({ defaultValues: emptyForm })
  const {
    control,
    getValues,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty, isSubmitting },
  } = methods
  const applyExplainer = (saved: IExplainer | null, relatedOptions?: IOption[], localContextHtml = "") => {
    if (relatedOptions) setOptions(relatedOptions)
    reset({
      introductionHtml: saved?.introductionHtml ?? "",
      beforeYouApplyHtml: saved?.beforeYouApplyHtml ?? "",
      steps: (saved?.steps ?? []).map((step) => ({ title: step.title, description: step.description })),
      links: (saved?.links ?? []).map((link) => ({ title: link.title, url: link.url })),
      documentsAttributes: (saved?.documents ?? []).map((document) => ({
        id: document.id,
        fileName: document.file?.metadata?.filename,
        file: document.file ?? undefined,
      })),
      relatedTemplateIds: [...(saved?.relatedTemplateIds ?? [])],
      isPublished: Boolean(saved?.publishedAt),
      localContextHtml,
    })
  }
  const steps = useFieldArray({ control, name: "steps" })
  const links = useFieldArray({ control, name: "links" })
  const documentsAttributes = useWatch({ control, name: "documentsAttributes" }) ?? []
  const isPublished = useWatch({ control, name: "isPublished" }) ?? false
  const relatedTemplateIds = useWatch({ control, name: "relatedTemplateIds" }) ?? []
  const stepValues = useWatch({ control, name: "steps" }) ?? []

  const { uppy, isUploading } = useUppyS3({
    maxNumberOfFiles: 10,
    autoProceed: true,
    onUploadSuccess: (file: UppyFile<{}, {}>, response: any) => {
      const uploaded: IUppyAttachmentFile = {
        id: extractUploadedFileKey(file, response),
        storage: "cache",
        metadata: {
          size: file.size || 0,
          filename: file.name || file.id,
          mimeType: file.type || "application/octet-stream",
        },
      }
      setValue(
        "documentsAttributes",
        [
          ...getValues("documentsAttributes"),
          {
            uppyFileId: file.id,
            fileName: uploaded.metadata.filename,
            file: uploaded,
          },
        ],
        { shouldDirty: true }
      )
    },
    onFileRemoved: (file) => {
      setValue(
        "documentsAttributes",
        getValues("documentsAttributes").flatMap((document) => {
          if (document.uppyFileId !== file.id) return [document]
          return document.id ? [{ ...document, _destroy: true }] : []
        }),
        { shouldDirty: true }
      )
    },
  })

  useEffect(() => {
    if (!isOpen) return
    let cancelled = false
    setLoading(true)
    setLoadError(false)
    const fetchExplainer = requirementTemplate?.fetchExplainer ?? templateVersion?.fetchExplainer
    if (!fetchExplainer) {
      setLoadError(true)
      setLoading(false)
      return
    }
    fetchExplainer()
      .then(async (result) => {
        if (cancelled) return
        if (!result) {
          setLoadError(true)
          setLoading(false)
          return
        }
        let localHtml = ""
        let localAt: string | null = null
        if (isReviewManager && jurisdictionId && templateVersion) {
          const savedLocal = await templateVersion.fetchJurisdictionExplainer(jurisdictionId)
          if (cancelled) return
          if (!savedLocal) {
            setLoadError(true)
            setLoading(false)
            return
          }
          localHtml = savedLocal.localContextHtml
          localAt = savedLocal.updatedAt
        }
        applyExplainer(result.explainer, result.relatedTemplateOptions, localHtml)
        setSavedExplainer(result.explainer)
        setJurisdictionExplainers(result.jurisdictionExplainers)
        setLocalUpdatedAt(localAt)
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [isOpen, requirementTemplate, templateVersion, jurisdictionId, isReviewManager])

  const explainerPublished = Boolean(explainer?.publishedAt)

  useEffect(() => {
    if (loading || !isReviewManager || !explainerPublished || !localSectionRef.current) return
    scrollWithinModalBody(localSectionRef.current)
  }, [loading, isReviewManager, explainerPublished])

  const persist = async (values: IFormValues) => {
    if (isReviewManager) {
      if (!templateVersion || !jurisdictionId || !explainerPublished) return false
      return await templateVersion.saveJurisdictionExplainer(jurisdictionId, values.localContextHtml)
    }
    if (isUploading || !requirementTemplate) return false
    const ok = await requirementTemplate.saveExplainer({
      introductionHtml: values.introductionHtml,
      beforeYouApplyHtml: values.beforeYouApplyHtml,
      steps: values.steps,
      links: values.links,
      documentsAttributes: documentsAttributesForSave(values.documentsAttributes),
      relatedTemplateIds: values.relatedTemplateIds,
      publish: values.isPublished,
    })
    if (!ok) return false
    setSavedExplainer(requirementTemplate.explainer)
    uppy.cancelAll()
    return true
  }

  const reorderSteps = (event: DragEndEvent) => {
    setActiveStepId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = steps.fields.findIndex((step) => step.id === active.id)
    const newIndex = steps.fields.findIndex((step) => step.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    steps.move(oldIndex, newIndex)
  }

  const startStepDrag = (event: DragStartEvent) => {
    setActiveStepId(String(event.active.id))
  }

  const onSave = handleSubmit(async (values) => {
    if (!(await persist(values))) return
    if (isReviewManager) onLocalContextSaved?.(values.localContextHtml)
    onClose()
  })

  const requestClose = () => {
    if (isDirty) closeConfirm.onOpen()
    else onClose()
  }
  const activeStepIndex = steps.fields.findIndex((step) => step.id === activeStepId)
  const activeStep = activeStepIndex >= 0 ? stepValues[activeStepIndex] : null
  const savedDocuments = documentsAttributes.filter((document) => document.id && !document._destroy)
  const selectedOptions = options.filter((option) => relatedTemplateIds.includes(option.value))
  const groupedOptions = groupFilterOptions(options, t("siteConfiguration.templateCategories.uncategorized"))
  const selectOptions = shouldShowFilterGroupLabels(groupedOptions) ? groupedOptions : options
  const lastSavedAt = isReviewManager ? localUpdatedAt : explainer?.updatedAt

  const renderActions = () => (
    <HStack spacing={3}>
      <Button type="button" variant="secondary" onClick={requestClose}>
        {t("ui.cancel")}
      </Button>
      <Button type="submit" variant="primary" isLoading={isSubmitting} isDisabled={isUploading || loading || loadError}>
        {t("ui.onlySave")}
      </Button>
    </HStack>
  )

  return (
    <>
      <Modal isOpen={isOpen} onClose={requestClose} scrollBehavior="inside" size="6xl">
        <ModalOverlay />
        <FormProvider {...methods}>
          <ModalContent
            as="form"
            noValidate
            maxW="1248px"
            onSubmit={(event) => {
              event.preventDefault()
              void onSave(event)
            }}
          >
            <ModalHeader pr={14}>
              <Flex justify="space-between" align="flex-start" gap={6}>
                <Box>
                  <Heading size="lg">{t("requirementTemplate.explainer.title")}</Heading>
                  {nickname && (
                    <Text mt={1} color="text.secondary" fontWeight="normal" fontSize="md">
                      {nickname}
                    </Text>
                  )}
                  <HStack mt={3} spacing={3}>
                    <StatusTag explainer={explainer} />
                    {lastSavedAt && (
                      <Text fontSize="sm" fontWeight="normal" color="text.secondary">
                        {t("requirementTemplate.explainer.lastSaved", {
                          time: format(new Date(lastSavedAt), datefnsTableDateTimeFormat),
                        })}
                      </Text>
                    )}
                  </HStack>
                </Box>
                {renderActions()}
              </Flex>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {loading ? (
                <LoadingScreen />
              ) : (
                !loadError && (
                  <VStack align="stretch" spacing={6}>
                    {explainer && !explainer.publishedAt && (
                      <CalloutBanner type="warning" title={t("requirementTemplate.explainer.draftBanner")} />
                    )}

                    {!isReviewManager && (
                      <FormControl>
                        <Checkbox {...methods.register("isPublished")}>
                          {t("requirementTemplate.explainer.published")}
                        </Checkbox>
                      </FormControl>
                    )}

                    <Controller
                      name="introductionHtml"
                      control={control}
                      rules={{
                        validate: (value) =>
                          isReviewManager ||
                          !isPublished ||
                          !isTipTapEmpty(value ?? "") ||
                          t("ui.isRequired", { field: t("requirementTemplate.explainer.introduction") }),
                      }}
                      render={({ field, fieldState }) => (
                        <FormControl isInvalid={!!fieldState.error}>
                          <FieldLabel required={!isReviewManager && isPublished}>
                            {t("requirementTemplate.explainer.introduction")}
                          </FieldLabel>
                          <Editor htmlValue={field.value} onChange={field.onChange} readonly={isReviewManager} />
                          <FormHelperText>{t("requirementTemplate.explainer.introductionRequired")}</FormHelperText>
                          <FormErrorMessage>{fieldState.error?.message}</FormErrorMessage>
                        </FormControl>
                      )}
                    />

                    <FormControl>
                      <FieldLabel>{t("requirementTemplate.explainer.beforeYouApply")}</FieldLabel>
                      <Controller
                        name="beforeYouApplyHtml"
                        control={control}
                        render={({ field }) => (
                          <Editor htmlValue={field.value} onChange={field.onChange} readonly={isReviewManager} />
                        )}
                      />
                    </FormControl>

                    <FormControl>
                      <FieldLabel>{t("requirementTemplate.explainer.howToApply")}</FieldLabel>
                      <FormHelperText mb={3}>{t("requirementTemplate.explainer.howToApplyHint")}</FormHelperText>
                      {isReviewManager ? (
                        <VStack align="stretch" spacing={3}>
                          {steps.fields.map((step, index) => (
                            <Flex key={step.id} bg="greys.grey03" p={4} borderRadius="md" gap={3} align="flex-start">
                              <Text fontWeight="semibold" w={6} mt={8}>
                                {index + 1}.
                              </Text>
                              <VStack flex="1" align="stretch" spacing={2}>
                                <TextFormControl
                                  fieldName={`steps.${index}.title`}
                                  label={t("requirementTemplate.explainer.stepTitle")}
                                  showOptional={false}
                                  isDisabled
                                />
                                <TextAreaFormControl
                                  fieldName={`steps.${index}.description`}
                                  label={t("requirementTemplate.explainer.stepDescription")}
                                  showOptional={false}
                                  isDisabled
                                />
                              </VStack>
                            </Flex>
                          ))}
                        </VStack>
                      ) : (
                        <>
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            modifiers={stepDragModifiers}
                            onDragStart={startStepDrag}
                            onDragCancel={() => setActiveStepId(null)}
                            onDragEnd={reorderSteps}
                          >
                            <SortableContext
                              items={steps.fields.map((step) => step.id)}
                              strategy={verticalListSortingStrategy}
                            >
                              <VStack align="stretch" spacing={3}>
                                {steps.fields.map((step, index) => (
                                  <SortableItem
                                    key={step.id}
                                    sortableArguments={{ id: step.id }}
                                    Component={HowToApplyStep}
                                    componentProps={{ index, onRemove: () => steps.remove(index) }}
                                  />
                                ))}
                              </VStack>
                            </SortableContext>
                            <DragOverlay dropAnimation={stepDropAnimation} modifiers={stepDragModifiers} zIndex={1600}>
                              {activeStep ? (
                                <StepDragPreview
                                  index={activeStepIndex}
                                  title={activeStep.title}
                                  description={activeStep.description}
                                />
                              ) : null}
                            </DragOverlay>
                          </DndContext>
                          <Button
                            type="button"
                            mt={3}
                            variant="tertiary"
                            leftIcon={<Plus size={16} />}
                            onClick={() => steps.append({ title: "", description: "" })}
                          >
                            {t("requirementTemplate.explainer.addStep")}
                          </Button>
                        </>
                      )}
                    </FormControl>

                    <Box>
                      <Heading as="h2" size="md" mb={4}>
                        {t("requirementTemplate.explainer.resources")}
                      </Heading>
                      <VStack align="stretch" spacing={5}>
                        <FormControl>
                          <FieldLabel>{t("requirementTemplate.explainer.documents")}</FieldLabel>
                          {!isReviewManager && <UppyDashboard uppy={uppy} height={180} width="100%" />}
                          {savedDocuments.length > 0 && (
                            <VStack align="stretch" mt={3} spacing={2}>
                              {savedDocuments.map((document) => (
                                <Flex key={document.id} justify="space-between" align="center" gap={3}>
                                  {document.id && document.file ? (
                                    <FileDownloadButton
                                      document={{
                                        id: document.id,
                                        file: document.file,
                                        createdAt: new Date(),
                                      }}
                                      modelType={EFileUploadAttachmentType.ExplainerDocument}
                                    />
                                  ) : (
                                    <Text fontSize="sm">{document.fileName}</Text>
                                  )}
                                  {!isReviewManager && (
                                    <Button
                                      type="button"
                                      variant="tertiary"
                                      size="sm"
                                      leftIcon={<X size={16} />}
                                      onClick={() =>
                                        setValue(
                                          "documentsAttributes",
                                          documentsAttributes.map((item) =>
                                            item.id === document.id ? { ...item, _destroy: true } : item
                                          ),
                                          { shouldDirty: true }
                                        )
                                      }
                                    >
                                      {t("ui.remove")}
                                    </Button>
                                  )}
                                </Flex>
                              ))}
                            </VStack>
                          )}
                        </FormControl>

                        <FormControl>
                          <FieldLabel>{t("requirementTemplate.explainer.externalLinks")}</FieldLabel>
                          <VStack align="stretch" spacing={3}>
                            {links.fields.map((link, index) => (
                              <Flex key={link.id} bg="greys.grey03" p={4} borderRadius="md" gap={3} align="flex-end">
                                <Box flex="1">
                                  <TextFormControl
                                    fieldName={`links.${index}.title`}
                                    label={t("requirementTemplate.explainer.linkTitle")}
                                    showOptional={false}
                                    isDisabled={isReviewManager}
                                  />
                                </Box>
                                <Box flex="1">
                                  <UrlFormControl
                                    fieldName={`links.${index}.url`}
                                    label={t("requirementTemplate.explainer.linkUrl")}
                                    showOptional={false}
                                    isDisabled={isReviewManager}
                                  />
                                </Box>
                                {!isReviewManager && (
                                  <Button
                                    type="button"
                                    variant="tertiary"
                                    leftIcon={<X size={16} />}
                                    onClick={() => links.remove(index)}
                                  >
                                    {t("ui.remove")}
                                  </Button>
                                )}
                              </Flex>
                            ))}
                          </VStack>
                          {!isReviewManager && (
                            <Button
                              type="button"
                              mt={3}
                              variant="tertiary"
                              leftIcon={<Plus size={16} />}
                              onClick={() => links.append({ title: "", url: "" })}
                            >
                              {t("requirementTemplate.explainer.addLink")}
                            </Button>
                          )}
                        </FormControl>
                      </VStack>
                    </Box>

                    <FormControl>
                      <FieldLabel>{t("requirementTemplate.explainer.relatedPermits")}</FieldLabel>
                      <FormHelperText mb={3}>{t("requirementTemplate.explainer.relatedPermitsHint")}</FormHelperText>
                      <Select<IOption, true, GroupBase<IOption>>
                        isMulti
                        isDisabled={isReviewManager}
                        isClearable={false}
                        options={selectOptions}
                        value={selectedOptions}
                        onChange={(selected) =>
                          setValue(
                            "relatedTemplateIds",
                            (selected ?? []).map((option) => option.value),
                            { shouldDirty: true }
                          )
                        }
                        placeholder={t("requirementTemplate.explainer.searchPermits")}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={{
                          control: (css, state) => ({
                            ...css,
                            borderColor: state.isFocused
                              ? "var(--chakra-colors-focus)"
                              : "var(--chakra-colors-border-light)",
                            borderRadius: "6px",
                            minHeight: "var(--chakra-sizes-10)",
                            height: "auto",
                            boxShadow: "none",
                            fontSize: "var(--chakra-fontSizes-sm)",
                            ":hover": {
                              borderColor: "var(--chakra-colors-border-base)",
                            },
                          }),
                          menu: (css) => ({
                            ...css,
                            zIndex: 1600,
                          }),
                          menuPortal: (base) => ({ ...base, zIndex: 1600 }),
                          groupHeading: (css) => ({
                            ...css,
                            textTransform: "none",
                            fontSize: "var(--chakra-fontSizes-sm)",
                            fontWeight: 700,
                            color: "var(--chakra-colors-text-secondary)",
                          }),
                          option: (css, state) => ({
                            ...css,
                            cursor: "pointer",
                            color: "var(--chakra-colors-text-primary)",
                            backgroundColor: state.isFocused ? "var(--chakra-colors-semantic-infoLight)" : undefined,
                            ":hover": {
                              backgroundColor: "var(--chakra-colors-gray-100)",
                            },
                          }),
                        }}
                      />
                    </FormControl>

                    <Box ref={localSectionRef}>
                      {isReviewManager ? (
                        explainerPublished && (
                          <Controller
                            name="localContextHtml"
                            control={control}
                            render={({ field }) => (
                              <LocalContextEditor htmlValue={field.value} onChange={field.onChange} />
                            )}
                          />
                        )
                      ) : (
                        <SuperAdminLocalContextPreview explainers={jurisdictionExplainers} />
                      )}
                    </Box>
                  </VStack>
                )
              )}
            </ModalBody>
            {!loading && !loadError && <ModalFooter justifyContent="flex-end">{renderActions()}</ModalFooter>}
          </ModalContent>
        </FormProvider>
      </Modal>
      <ConfirmationModal
        title={t("requirementTemplate.explainer.cancelTitle")}
        body={t("requirementTemplate.explainer.cancelBody")}
        renderTriggerButton={() => null}
        modalControlProps={{
          isOpen: closeConfirm.isOpen,
          onOpen: closeConfirm.onOpen,
          onClose: closeConfirm.onClose,
        }}
        onConfirm={(closeModal) => {
          closeModal()
          onClose()
        }}
      />
    </>
  )
})

function SuperAdminLocalContextPreview({ explainers }: { explainers: IJurisdictionExplainer[] }) {
  const { t } = useTranslation()
  const sectionRef = useRef<HTMLDivElement>(null)
  const options: IOption[] = explainers.map((item) => ({
    label: item.qualifiedName || item.name,
    value: item.id,
  }))
  const [selectedId, setSelectedId] = useState("")

  useEffect(() => {
    if (selectedId && !options.some((option) => option.value === selectedId)) {
      setSelectedId("")
    }
  }, [explainers, selectedId])

  useEffect(() => {
    if (!selectedId) return
    scrollWithinModalBody(sectionRef.current)
  }, [selectedId])

  const selected = explainers.find((item) => item.id === selectedId)
  const selectedOption = options.find((option) => option.value === selectedId) ?? null

  return (
    <Box ref={sectionRef}>
      <FieldLabel optional={false}>{t("requirementTemplate.explainer.localCommunity")}</FieldLabel>
      <Flex gap={2} align="flex-start" mb={2}>
        <Box flexShrink={0} mt="2px">
          <Info size={16} />
        </Box>
        <Text fontSize="sm">{t("requirementTemplate.explainer.localContextReadOnly")}</Text>
      </Flex>
      <Text fontSize="sm" mb={4}>
        {t("requirementTemplate.explainer.localContextReadOnlyHint")}
      </Text>
      {explainers.length === 0 ? (
        <Text color="text.secondary">{t("requirementTemplate.explainer.localContextEmpty")}</Text>
      ) : (
        <FormControl mb={selected ? 4 : 0}>
          <FormLabel htmlFor="explainer-local-jurisdiction-select">
            {t("requirementTemplate.explainer.localContextJurisdiction")}
          </FormLabel>
          <Select<IOption>
            inputId="explainer-local-jurisdiction-select"
            isClearable
            options={options}
            value={selectedOption}
            onChange={(option) => setSelectedId(option?.value ?? "")}
            placeholder={t("requirementTemplate.explainer.localContextSelectPlaceholder")}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{
              control: (css, state) => ({
                ...css,
                borderColor: state.isFocused ? "var(--chakra-colors-focus)" : "var(--chakra-colors-border-light)",
                borderRadius: "6px",
                minHeight: "var(--chakra-sizes-10)",
                boxShadow: "none",
                fontSize: "var(--chakra-fontSizes-sm)",
                ":hover": {
                  borderColor: "var(--chakra-colors-border-base)",
                },
              }),
              menu: (css) => ({
                ...css,
                zIndex: 1600,
              }),
              menuPortal: (base) => ({ ...base, zIndex: 1600 }),
              option: (css, state) => ({
                ...css,
                cursor: "pointer",
                color: "var(--chakra-colors-text-primary)",
                backgroundColor: state.isFocused ? "var(--chakra-colors-semantic-infoLight)" : undefined,
                ":hover": {
                  backgroundColor: "var(--chakra-colors-gray-100)",
                },
              }),
            }}
          />
          {!selected && <FormHelperText>{t("requirementTemplate.explainer.localContextUnselected")}</FormHelperText>}
        </FormControl>
      )}
      {selected && (
        <FromYourLocalJurisdiction
          html={selected.localContextHtml}
          updatedAt={selected.updatedAt}
          jurisdictionName={selected.qualifiedName || selected.name}
        />
      )}
    </Box>
  )
}

function StepDragPreview({ index, title, description }: { index: number; title: string; description: string }) {
  const { t } = useTranslation()
  return (
    <Flex bg="greys.grey03" p={4} borderRadius="md" boxShadow="lg" gap={3} align="flex-start" cursor="grabbing">
      <HStack spacing={1} flexShrink={0}>
        <IconButton
          aria-label={t("requirementTemplate.explainer.dragStep")}
          icon={<DotsSixVertical />}
          variant="ghost"
          size="sm"
        />
        <Text fontWeight="semibold" w={6}>
          {index + 1}.
        </Text>
      </HStack>
      <Box minW={0}>
        <Text fontWeight="semibold">{title || t("requirementTemplate.explainer.stepTitle")}</Text>
        {description && (
          <Text fontSize="sm" color="text.secondary" noOfLines={2}>
            {description}
          </Text>
        )}
      </Box>
    </Flex>
  )
}

function FieldLabel({
  required,
  optional = true,
  children,
}: {
  required?: boolean
  optional?: boolean
  children: React.ReactNode
}) {
  const { t } = useTranslation()
  return (
    <FormLabel>
      {children}
      {required ? (
        <Text as="span" color="semantic.error" ml={1}>
          *
        </Text>
      ) : (
        optional && ` ${t("ui.optional")}`
      )}
    </FormLabel>
  )
}

function HowToApplyStep({
  index,
  onRemove,
  sortableProps,
  dragMotionStyles,
}: {
  index: number
  onRemove: () => void
  dragMotionStyles: CSSProperties
  sortableProps: ReturnType<typeof useSortable>
}) {
  const { t } = useTranslation()
  return (
    <Flex
      ref={sortableProps.setNodeRef}
      style={dragMotionStyles}
      bg="greys.grey03"
      p={4}
      borderRadius="md"
      gap={3}
      align="flex-start"
      opacity={sortableProps.isDragging ? 0.35 : 1}
    >
      <HStack mt={8} spacing={1} flexShrink={0}>
        <IconButton
          aria-label={t("requirementTemplate.explainer.dragStep")}
          icon={<DotsSixVertical />}
          variant="ghost"
          size="sm"
          cursor="grab"
          {...sortableProps.attributes}
          {...sortableProps.listeners}
        />
        <Text fontWeight="semibold" w={6}>
          {index + 1}.
        </Text>
      </HStack>
      <VStack flex="1" align="stretch" spacing={2}>
        <TextFormControl
          fieldName={`steps.${index}.title`}
          label={t("requirementTemplate.explainer.stepTitle")}
          showOptional={false}
        />
        <TextAreaFormControl
          fieldName={`steps.${index}.description`}
          label={t("requirementTemplate.explainer.stepDescription")}
          showOptional={false}
        />
      </VStack>
      <Button type="button" mt={8} variant="tertiary" leftIcon={<X size={16} />} onClick={onRemove}>
        {t("ui.remove")}
      </Button>
    </Flex>
  )
}

function StatusTag({ explainer }: { explainer: IExplainer | null }) {
  const { t } = useTranslation()
  if (!explainer) return null
  const isDraft = !explainer.publishedAt
  return (
    <Tag size="sm" bg={isDraft ? "semantic.warningLight" : "theme.blueLight"} color="text.primary">
      {isDraft ? t("requirementTemplate.explainer.statusDraft") : t("requirementTemplate.explainer.statusPublished")}
    </Tag>
  )
}
