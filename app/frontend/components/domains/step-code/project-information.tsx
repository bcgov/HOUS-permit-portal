import {
  Button,
  Center,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Radio,
  Table,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import { ArrowRight, CaretLeft, DotsThreeVertical, Download, MapPin, PaperPlaneRight } from "@phosphor-icons/react"
import { format } from "date-fns"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo, useState } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useNavigate, useParams } from "react-router-dom"
import { datefnsAppDateFormat } from "../../../constants"
import { IJurisdiction } from "../../../models/jurisdiction"
import { useMst } from "../../../setup/root"
import {
  EFileUploadAttachmentType,
  EFlashMessageStatus,
  EStepCodeChecklistStage,
  EStepCodeChecklistStatus,
  EStepCodeStageStatus,
} from "../../../types/enums"
import { IOption, IReportDocument } from "../../../types/types"
import { downloadFileFromStorage } from "../../../utils/utility-functions"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { ConfirmationModal } from "../../shared/confirmation-modal"
import { DatePickerFormControl } from "../../shared/form/input-form-control"
import { InfoTooltip } from "../../shared/info-tooltip"
import { RouterLink } from "../../shared/navigation/router-link"
import { SitesSelect } from "../../shared/select/selectors/sites-select"
import { StepCodeStageIcon } from "../permit-project/step-code-stage-indicators"
import { SectionHeading } from "./part-3/form-section/shared/section-heading"

type TStepCodeKind = "part3" | "part9"

interface IProjectInformationForm {
  fullAddress?: string
  referenceNumber?: string
  permitDate?: string | Date | null
  pid?: string
  site?: IOption
  jurisdictionId?: string
}

interface IProjectInformationProps {
  currentStepCode: any
  defaultSectionCompletionStatus: Record<string, any>
  stepCodeKind: TStepCodeKind
}

const stageOptions = [
  EStepCodeChecklistStage.preConstruction,
  EStepCodeChecklistStage.midConstruction,
  EStepCodeChecklistStage.asBuilt,
]

const stageTableHeaderProps = {
  py: 2,
  textTransform: "none" as const,
  letterSpacing: "normal",
  fontSize: "md",
  fontWeight: "semibold",
  color: "text.primary",
  lineHeight: "27px",
  borderBottom: "1px solid",
  borderColor: "border.light",
}

const stepCodesPath = "/step-codes?currentPage=1"

// ponytail: both Part 3 and Part 9 end on `report`. If a part gets a different
// results landing, look it up from that part's navLinks instead of hardcoding.
const REPORT_SECTION = "report"

function checklistHasProgress(checklist: {
  sectionCompletionStatus?: Record<string, { complete: boolean; relevant: boolean }>
}) {
  return Object.values(checklist.sectionCompletionStatus ?? {}).some((status) => status.relevant && status.complete)
}

function isChecklistComplete(checklist: { status?: EStepCodeChecklistStatus } | null, stageIsComplete = false) {
  return stageIsComplete || checklist?.status === EStepCodeChecklistStatus.complete
}

function checklistButtonLabel(
  checklist: {
    status?: EStepCodeChecklistStatus
    sectionCompletionStatus?: Record<string, { complete: boolean; relevant: boolean }>
  } | null,
  stageIsComplete = false,
  isLocked = false
) {
  if (!checklist) return t("stepCode.projectInformation.start")
  if (isChecklistComplete(checklist, stageIsComplete)) {
    return t("stepCode.projectInformation.viewReport")
  }
  if (isLocked) return t("stepCode.projectInformation.view")
  if (checklistHasProgress(checklist)) return t("stepCode.projectInformation.continue")
  return t("stepCode.projectInformation.start")
}

function checklistSectionToOpen(
  checklist: {
    status?: EStepCodeChecklistStatus
    currentNavLink?: { location?: string }
  } | null,
  stageIsComplete = false
) {
  if (isChecklistComplete(checklist, stageIsComplete)) return REPORT_SECTION
  return checklist?.currentNavLink?.location || "start"
}

export const ProjectInformation = observer(function StepCodeProjectInformation({
  currentStepCode,
  defaultSectionCompletionStatus,
  stepCodeKind,
}: IProjectInformationProps) {
  const { permitApplicationId } = useParams()
  const navigate = useNavigate()
  const { permitApplicationStore } = useMst()
  const permitApplication = permitApplicationId ? permitApplicationStore.currentPermitApplication : null
  const pinnedStage =
    permitApplication?.stepCodeStage || currentStepCode?.currentStage || EStepCodeChecklistStage.preConstruction
  const [selectedStage, setSelectedStage] = useState<EStepCodeChecklistStage>(pinnedStage)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const isEditable = !permitApplicationId
  const isLockedBySubmittedPermit = !!permitApplication && !permitApplication.isDraft

  const stageChecklist = useMemo(
    () => currentStepCode?.checklists?.find((checklist) => checklist.stage === selectedStage),
    [currentStepCode?.checklists?.length, selectedStage]
  )

  const formMethods = useForm<IProjectInformationForm>({
    defaultValues: getDefaultValues(currentStepCode),
  })

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = formMethods

  useEffect(() => {
    if (!currentStepCode) return

    setSelectedStage(
      permitApplication?.stepCodeStage || currentStepCode.currentStage || EStepCodeChecklistStage.preConstruction
    )
  }, [currentStepCode?.id, currentStepCode?.currentStage, permitApplication?.stepCodeStage])

  useEffect(() => {
    if (!currentStepCode) return

    reset(getDefaultValues(currentStepCode))
  }, [currentStepCode?.id, currentStepCode?.currentStage, reset])

  const stageLabel = (stage: EStepCodeChecklistStage) => t(`stepCodeChecklist.edit.projectInfo.stages.${stage}`)
  // ponytail: standalone only — permit-linked dates come from the application.
  const permitDateRequired = isEditable && selectedStage !== EStepCodeChecklistStage.preConstruction
  const showPermitDate = isEditable || selectedStage !== EStepCodeChecklistStage.preConstruction

  const handleStageSelect = (stage: EStepCodeChecklistStage) => {
    setSelectedStage(stage)
    if (stage === EStepCodeChecklistStage.preConstruction) {
      formMethods.clearErrors("permitDate")
    }
  }

  const fieldTooltipProps = {
    hasArrow: true,
    placement: "top" as const,
    maxW: "400px",
    whiteSpace: "normal" as const,
  }

  const checklistPath = (stage: EStepCodeChecklistStage, section: string) => {
    const partPath = stepCodeKind === "part3" ? "part-3-step-code" : "part-9-step-code"
    if (permitApplicationId) {
      return `/permit-applications/${permitApplicationId}/edit/${partPath}/stages/${stage}/${section}`
    }

    return `/${partPath}/${currentStepCode.id}/stages/${stage}/${section}`
  }

  const saveProjectInformation = async (values: IProjectInformationForm) => {
    if (!currentStepCode) return

    setSubmitError(null)
    setIsSubmitting(true)
    try {
      let checklist = stageChecklist

      if (permitApplicationId && permitApplication) {
        const response = await permitApplication.update({
          autosave: false,
          stepCodeStage: selectedStage,
        })
        if (!response.ok) throw new Error("Permit application update failed")
      } else {
        const updateValues: Record<string, any> = { currentStage: selectedStage }
        Object.assign(updateValues, {
          fullAddress: values.fullAddress,
          pid: values.pid,
          referenceNumber: values.referenceNumber,
          permitDate: values.permitDate,
          jurisdictionId: values.jurisdictionId,
        })

        const stepCodeUpdated = await currentStepCode.update(updateValues)
        if (!stepCodeUpdated) throw new Error("Step Code update failed")
      }

      if (!checklist) {
        checklist = await currentStepCode.createChecklist({
          stage: selectedStage,
          sectionCompletionStatus: defaultSectionCompletionStatus,
        })
      }
      if (!checklist) throw new Error("Checklist create failed")

      return checklist
    } catch {
      setSubmitError(t("stepCode.projectInformation.error"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const ensurePermitDateIfRequired = (values: IProjectInformationForm) => {
    if (!permitDateRequired || !isBlankPermitDate(values.permitDate)) return true

    formMethods.setError("permitDate", {
      type: "required",
      message: t("ui.isRequired", { field: t("stepCode.projectInformation.date") }),
    })
    formMethods.setFocus("permitDate")
    return false
  }

  const onSubmit = async (values: IProjectInformationForm) => {
    if (isLockedBySubmittedPermit) return
    if (!ensurePermitDateIfRequired(values)) return

    const checklist = await saveProjectInformation(values)
    if (!checklist) return

    const nextSection = checklistSectionToOpen(checklist, currentStepCode?.isStageComplete(selectedStage))
    navigate(checklistPath(selectedStage, nextSection))
  }

  const handleSaveAndGoBack = handleSubmit(async (values) => {
    if (!ensurePermitDateIfRequired(values)) return

    const checklist = await saveProjectInformation(values)
    if (!checklist) return

    navigate(stepCodesPath)
  })

  const handleOpenExistingChecklist = (
    stage: EStepCodeChecklistStage,
    checklist: {
      status?: EStepCodeChecklistStatus
      currentNavLink?: { location?: string }
    } | null
  ) => {
    if (!checklist) return
    navigate(checklistPath(stage, checklistSectionToOpen(checklist, currentStepCode?.isStageComplete(stage))))
  }
  const stepCodeKindLabel =
    stepCodeKind === "part3"
      ? t("stepCode.projectInformation.types.part3")
      : t("stepCode.projectInformation.types.part9")

  if (!currentStepCode) {
    return (
      <Center p={10}>
        <SharedSpinner />
      </Center>
    )
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction="column" gap={6} pb={4}>
          <Flex direction="column" gap={2}>
            <Flex justify="space-between" align="flex-end" gap={4} w="full">
              <HStack align="flex-end" spacing={3}>
                <SectionHeading>{t("stepCode.projectInformation.heading")}</SectionHeading>
                <Tag bg="theme.blueLight" color="text.primary" fontWeight="bold" mb={2}>
                  {stepCodeKindLabel}
                </Tag>
              </HStack>
            </Flex>
            <Text fontSize="md">{t("stepCode.projectInformation.instructions")}</Text>
            {isLockedBySubmittedPermit && (
              <CustomMessageBox
                status={EFlashMessageStatus.warning}
                description={t("stepCode.projectInformation.lockedBySubmittedPermit")}
              />
            )}
          </Flex>

          {!isEditable && <Field label={t("stepCode.projectInformation.name")} value={currentStepCode.title} />}

          <Flex gap={{ base: 6, xl: 6 }} direction="column">
            <FormControl isInvalid={isEditable && !!errors.fullAddress}>
              {isEditable ? (
                <>
                  <Controller
                    name="site"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <SitesSelect
                        onChange={(option: IOption) => {
                          onChange(option)
                          formMethods.setValue("fullAddress", option?.label || "", { shouldValidate: true })
                        }}
                        selectedOption={value}
                        pidName="pid"
                        siteName="site"
                        jurisdictionIdFieldName="jurisdictionId"
                        jurisdictionRequired
                        initialJurisdiction={currentStepCode.jurisdiction as IJurisdiction | null}
                        menuPortalTarget={document.body}
                      />
                    )}
                  />
                  <input type="hidden" {...register("fullAddress", { required: true })} />
                </>
              ) : (
                <Flex direction="column" gap={2}>
                  <FormLabel>{t("stepCode.projectInformation.address")}</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <MapPin />
                    </InputLeftElement>
                    <Input isDisabled value={currentStepCode.fullAddress || ""} />
                  </InputGroup>
                </Flex>
              )}
              {isEditable && <FormErrorMessage>{errors.fullAddress?.message}</FormErrorMessage>}
            </FormControl>

            {!isEditable && (
              <>
                <Field
                  label={t("stepCode.projectInformation.jurisdiction")}
                  value={currentStepCode.jurisdictionName || currentStepCode.jurisdiction?.qualifiedName}
                />
                <Field label={t("stepCode.projectInformation.pid")} value={currentStepCode.pid} />
              </>
            )}
          </Flex>

          {isEditable ? (
            <FormControl>
              <HStack gap={1} mb={2}>
                <FormLabel htmlFor="referenceNumber" mb={0}>
                  {t("stepCode.projectInformation.identifier")}
                </FormLabel>
                <Text>{t("ui.optional")}</Text>
                <Flex ml={2}>
                  <InfoTooltip
                    {...fieldTooltipProps}
                    label={t("stepCode.projectInformation.identifierTooltip") as string}
                  />
                </Flex>
              </HStack>
              <Input id="referenceNumber" {...register("referenceNumber")} />
            </FormControl>
          ) : (
            <Field
              label={t("stepCode.projectInformation.identifier")}
              tooltip={t("stepCode.projectInformation.identifierTooltip") as string}
              value={currentStepCode.referenceNumber}
            />
          )}

          {submitError && (
            <Text color="semantic.error" fontSize="sm">
              {submitError}
            </Text>
          )}

          <FormControl>
            {permitApplicationId && (
              <Text fontSize="sm" color="text.secondary" mb={3}>
                {t("stepCode.projectInformation.permitStageHelp")}
              </Text>
            )}
            <Table variant="simple" size="sm">
              <Thead>
                <Tr borderTop="none">
                  <Th colSpan={2} pl={0} {...stageTableHeaderProps}>
                    {permitApplicationId
                      ? t("stepCode.projectInformation.permitStage")
                      : t("stepCode.projectInformation.stage")}
                  </Th>
                  <Th width="1px" px={2} textAlign="center" whiteSpace="nowrap" {...stageTableHeaderProps}>
                    {t("stepCode.projectInformation.progress")}
                  </Th>
                  <Th pr={0} {...stageTableHeaderProps}></Th>
                </Tr>
              </Thead>
              <Tbody>
                {stageOptions.map((stage) => {
                  const isSelected = selectedStage === stage
                  const checklist = currentStepCode?.checklists?.find(
                    (stepCodeChecklist) => stepCodeChecklist.stage === stage
                  )
                  const stageStatus =
                    currentStepCode?.stageStatus?.(stage) ??
                    currentStepCode?.stageCompletions?.find((entry) => entry.stage === stage)?.status ??
                    EStepCodeStageStatus.notStarted

                  return (
                    <Tr
                      key={stage}
                      cursor="pointer"
                      bg={isSelected ? "theme.blueLight" : undefined}
                      onClickCapture={(event) => {
                        const target = event.target as HTMLElement
                        if (target.closest(".chakra-radio") && (target as HTMLInputElement).type !== "radio") {
                          event.preventDefault()
                        }
                      }}
                      onClick={(event) => {
                        const target = event.target as HTMLElement
                        if ((target as HTMLInputElement).type === "radio") return
                        handleStageSelect(stage)
                      }}
                    >
                      <Td pl={0} width="1px">
                        <Radio
                          isChecked={isSelected}
                          onChange={() => handleStageSelect(stage)}
                          id={`step-code-stage-${stage}`}
                          value={stage}
                          aria-label={stageLabel(stage)}
                        />
                      </Td>
                      <Td fontWeight={isSelected ? "bold" : "normal"}>{stageLabel(stage)}</Td>
                      <Td width="1px" px={2} textAlign="center">
                        <StepCodeStageIcon status={stageStatus} />
                      </Td>
                      <Td pr={0} textAlign="right">
                        <HStack justify="flex-end" spacing={1} onClick={(e) => e.stopPropagation()}>
                          <Button
                            type={isLockedBySubmittedPermit ? "button" : "submit"}
                            variant="primary"
                            isDisabled={isLockedBySubmittedPermit ? !checklist : !isSelected}
                            isLoading={!isLockedBySubmittedPermit && isSelected && isSubmitting}
                            onClick={
                              isLockedBySubmittedPermit
                                ? () => handleOpenExistingChecklist(stage, checklist)
                                : undefined
                            }
                          >
                            {checklistButtonLabel(
                              checklist,
                              currentStepCode?.isStageComplete(stage),
                              isLockedBySubmittedPermit
                            )}
                          </Button>
                          <StageReportMenu
                            checklist={checklist}
                            stageLabel={stageLabel(stage)}
                            stepCode={currentStepCode}
                            reportPath={checklistPath(stage, REPORT_SECTION)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
            {permitApplicationId &&
              !isLockedBySubmittedPermit &&
              selectedStage !== EStepCodeChecklistStage.preConstruction && (
                <CustomMessageBox
                  status={EFlashMessageStatus.warning}
                  description={t("stepCode.projectInformation.nonPreConstructionStageWarning")}
                  mt={3}
                />
              )}
          </FormControl>

          {showPermitDate &&
            (isEditable ? (
              <DatePickerFormControl
                key={permitDateRequired ? "permit-date-required" : "permit-date-optional"}
                flex={1}
                maxW={{ base: "none", xl: "430px" }}
                label={t("stepCode.projectInformation.date") as string}
                fieldName="permitDate"
                required={permitDateRequired}
                LabelInfo={() => (
                  <Flex ml={2}>
                    <InfoTooltip
                      {...fieldTooltipProps}
                      label={t("stepCode.projectInformation.dateTooltip") as string}
                    />
                  </Flex>
                )}
              />
            ) : (
              <Field
                label={t("stepCode.projectInformation.date") as string}
                tooltip={t("stepCode.projectInformation.dateTooltip") as string}
                value={formatPermitDate(permitApplication?.issuedAt)}
              />
            ))}

          {isEditable && (
            <Flex justify="flex-start">
              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveAndGoBack}
                isDisabled={isSubmitting}
                isLoading={isSubmitting}
                leftIcon={<CaretLeft size={16} />}
              >
                {t("ui.back")}
              </Button>
            </Flex>
          )}
        </Flex>
      </form>
    </FormProvider>
  )
})

function formatPermitDate(value: Date | string | null | undefined) {
  if (!value) return ""
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? "" : format(date, datefnsAppDateFormat)
}

function isBlankPermitDate(value: Date | string | null | undefined) {
  return !formatPermitDate(value)
}

function getDefaultValues(currentStepCode): IProjectInformationForm {
  return {
    fullAddress: currentStepCode?.fullAddress || "",
    referenceNumber: currentStepCode?.referenceNumber || "",
    permitDate: currentStepCode?.permitDate || null,
    pid: currentStepCode?.pid || "",
    jurisdictionId: currentStepCode?.jurisdiction?.id || "",
    site: currentStepCode?.fullAddress
      ? {
          label: currentStepCode.fullAddress,
          value: null,
        }
      : null,
  }
}

interface IFieldProps {
  label: string
  value: string | undefined
  tooltip?: string
}

const Field = function Field({ label, value, tooltip }: IFieldProps) {
  return (
    <FormControl>
      <HStack gap={1} mb={2}>
        <FormLabel mb={0}>{label}</FormLabel>
        {tooltip && (
          <Flex ml={2}>
            <InfoTooltip hasArrow placement="top" maxW="400px" whiteSpace="normal" label={tooltip} />
          </Flex>
        )}
      </HStack>
      <Input isDisabled value={value || ""} textOverflow="ellipsis" textAlign="left" />
    </FormControl>
  )
}

const StageReportMenu = observer(function StageReportMenu({
  checklist,
  stageLabel,
  stepCode,
  reportPath,
}: {
  checklist?: {
    reportDocument?: IReportDocument | null
    freshReportDocument?: IReportDocument | null
  } | null
  stageLabel: string
  stepCode: any
  reportPath: string
}) {
  const [isSharing, setIsSharing] = useState(false)
  const freshReport = checklist?.freshReportDocument ?? null
  const reportDocument = checklist?.reportDocument ?? null
  const hasStaleReport = !!reportDocument?.stale && !freshReport

  const handleDownload = () => {
    if (!freshReport) return
    downloadFileFromStorage({
      model: EFileUploadAttachmentType.ReportDocument,
      modelId: freshReport.id,
      filename: freshReport.file?.metadata?.filename,
    })
  }

  const handleShare = async () => {
    if (!freshReport) return
    setIsSharing(true)
    try {
      await stepCode?.shareReportWithJurisdiction(freshReport.id)
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        type="button"
        aria-label={t("ui.options")}
        icon={<DotsThreeVertical size={20} />}
        variant="ghost"
        size="sm"
      />
      <MenuList>
        {freshReport ? (
          <MenuItem icon={<Download size={16} />} onClick={handleDownload}>
            {t("stepCode.index.downloadStageReport", { stage: stageLabel })}
          </MenuItem>
        ) : hasStaleReport ? (
          <MenuItem as={RouterLink} to={reportPath} icon={<ArrowRight size={16} />}>
            {t("stepCode.index.reportOutOfDate")}
          </MenuItem>
        ) : (
          <MenuItem isDisabled>
            <Text>{t("stepCode.index.noReportAvailable")}</Text>
          </MenuItem>
        )}
        {freshReport && stepCode?.jurisdiction && (
          <ConfirmationModal
            title={t("stepCode.shareReport.confirmTitle")}
            body={t("stepCode.shareReport.confirmBody")}
            onConfirm={async (closeModal) => {
              await handleShare()
              closeModal()
            }}
            renderTriggerButton={(props) => (
              <MenuItem icon={<PaperPlaneRight size={16} />} isDisabled={isSharing} {...props}>
                {t("stepCode.shareReport.action")}
              </MenuItem>
            )}
            renderConfirmationButton={(props) => (
              <Button {...props} variant="primary" isLoading={isSharing}>
                {t("stepCode.shareReport.confirm")}
              </Button>
            )}
          />
        )}
      </MenuList>
    </Menu>
  )
})
