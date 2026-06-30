import {
  Button,
  Center,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Radio,
  Table,
  Tbody,
  Td,
  Text,
  Tr,
} from "@chakra-ui/react"
import { MapPin } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo, useState } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useNavigate, useParams } from "react-router-dom"
import { IJurisdiction } from "../../../models/jurisdiction"
import { EStepCodeBuildingType, EStepCodeChecklistStage, EStepCodeType } from "../../../types/enums"
import { IOption } from "../../../types/types"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { DatePickerFormControl, TextFormControl } from "../../shared/form/input-form-control"
import { InfoTooltip } from "../../shared/info-tooltip"
import { SitesSelect } from "../../shared/select/selectors/sites-select"
import { SectionHeading } from "./part-3/form-section/shared/section-heading"
import { BuildingTypeSelect } from "./part-9/checklist/project-info/building-type-select"

type TStepCodeKind = "part3" | "part9"

interface IProjectInformationForm {
  fullAddress?: string
  referenceNumber?: string
  permitDate?: string
  pid?: string
  builder?: string
  buildingType?: EStepCodeBuildingType
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

export const ProjectInformation = observer(function StepCodeProjectInformation({
  currentStepCode,
  defaultSectionCompletionStatus,
  stepCodeKind,
}: IProjectInformationProps) {
  const { permitApplicationId } = useParams()
  const navigate = useNavigate()
  const [selectedStage, setSelectedStage] = useState<EStepCodeChecklistStage>(
    currentStepCode?.currentStage || EStepCodeChecklistStage.preConstruction
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const isEditable = !permitApplicationId

  const stageChecklist = useMemo(
    () => currentStepCode?.checklists?.find((checklist) => checklist.stage === selectedStage),
    [currentStepCode?.checklists?.length, selectedStage]
  )
  const isStageChecklistLoading = Boolean(stepCodeKind === "part9" && stageChecklist && !stageChecklist.isLoaded)

  const formMethods = useForm<IProjectInformationForm>({
    defaultValues: getDefaultValues(currentStepCode),
  })

  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors },
  } = formMethods

  useEffect(() => {
    if (!currentStepCode) return

    setSelectedStage(currentStepCode.currentStage || EStepCodeChecklistStage.preConstruction)
  }, [currentStepCode?.id, currentStepCode?.currentStage])

  useEffect(() => {
    if (!currentStepCode) return

    reset(getDefaultValues(currentStepCode, stageChecklist))
  }, [currentStepCode?.id, currentStepCode?.currentStage, reset])

  useEffect(() => {
    if (stepCodeKind !== "part9") return

    setValue("builder", stageChecklist?.builder || "")
    setValue("buildingType", stageChecklist?.buildingType ?? undefined)
  }, [
    stepCodeKind,
    stageChecklist?.id,
    stageChecklist?.isLoaded,
    stageChecklist?.builder,
    stageChecklist?.buildingType,
    setValue,
  ])

  useEffect(() => {
    if (stepCodeKind !== "part9") return
    if (!stageChecklist || stageChecklist.isLoaded) return

    stageChecklist.load()
  }, [stageChecklist?.id, stageChecklist?.isLoaded, stepCodeKind])

  const stageLabel = (stage: EStepCodeChecklistStage) => t(`stepCodeChecklist.edit.projectInfo.stages.${stage}`)
  const showPermitDate = selectedStage !== EStepCodeChecklistStage.preConstruction

  const handleStageSelect = (stage: EStepCodeChecklistStage) => {
    setSelectedStage(stage)
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

  const onSubmit = async (values: IProjectInformationForm) => {
    if (!currentStepCode) return

    setSubmitError(null)
    setIsSubmitting(true)
    try {
      let checklist = stageChecklist
      const updateValues: Record<string, any> = { currentStage: selectedStage }
      if (isEditable) {
        Object.assign(updateValues, {
          fullAddress: values.fullAddress,
          pid: values.pid,
          referenceNumber: values.referenceNumber,
          permitDate: values.permitDate,
          jurisdictionId: values.jurisdictionId,
        })
      }

      const stepCodeUpdated = await currentStepCode.update(updateValues)
      if (!stepCodeUpdated) throw new Error("Step Code update failed")

      const part9ChecklistValues =
        stepCodeKind === "part9"
          ? {
              builder: values.builder,
              buildingType: values.buildingType,
            }
          : {}

      if (!checklist) {
        checklist = await currentStepCode.createChecklist({
          stage: selectedStage,
          sectionCompletionStatus: defaultSectionCompletionStatus,
          ...part9ChecklistValues,
        })
      } else if (stepCodeKind === "part9") {
        const checklistUpdated = await checklist.update(part9ChecklistValues)
        if (!checklistUpdated) throw new Error("Checklist update failed")
      }
      if (!checklist) throw new Error("Checklist create failed")

      const nextSection = checklist.currentNavLink?.location || "start"
      navigate(checklistPath(selectedStage, nextSection))
    } catch {
      setSubmitError(t("stepCode.projectInformation.error"))
    } finally {
      setIsSubmitting(false)
    }
  }

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
            <SectionHeading>{t("stepCode.projectInformation.heading")}</SectionHeading>
            <Text fontSize="md">{t("stepCode.projectInformation.instructions")}</Text>
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
                          setValue("fullAddress", option?.label || "", { shouldValidate: true })
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
                <InfoTooltip
                  {...fieldTooltipProps}
                  label={t("stepCode.projectInformation.identifierTooltip") as string}
                />
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

          {isStageChecklistLoading ? (
            <Center p={4}>
              <SharedSpinner />
            </Center>
          ) : (
            stepCodeKind === "part9" && (
              <Flex gap={{ base: 6, xl: 6 }} direction={{ base: "column", xl: "row" }}>
                <TextFormControl label={t("stepCodeChecklist.edit.projectInfo.builder")} fieldName="builder" />
                <FormControl>
                  <FormLabel>{t("stepCodeChecklist.edit.projectInfo.buildingType.label")}</FormLabel>
                  <InputGroup>
                    <Controller
                      control={control}
                      name="buildingType"
                      render={({ field: { onChange, value } }) => (
                        <BuildingTypeSelect onChange={onChange} value={value} />
                      )}
                    />
                  </InputGroup>
                </FormControl>
              </Flex>
            )
          )}

          {showPermitDate && (
            <DatePickerFormControl
              flex={1}
              maxW={{ base: "none", xl: "430px" }}
              label={t("stepCode.projectInformation.date") as string}
              fieldName="permitDate"
              showOptional={false}
              inputProps={
                isEditable && currentStepCode.type === EStepCodeType.part3StepCode ? undefined : { readOnly: true }
              }
              isReadOnly={!(isEditable && currentStepCode.type === EStepCodeType.part3StepCode)}
              LabelInfo={() => (
                <InfoTooltip {...fieldTooltipProps} label={t("stepCode.projectInformation.dateTooltip") as string} />
              )}
            />
          )}

          {submitError && (
            <Text color="semantic.error" fontSize="sm">
              {submitError}
            </Text>
          )}

          <FormControl>
            <FormLabel>{t("stepCode.projectInformation.stage")}</FormLabel>
            <Table variant="simple" size="sm">
              <Tbody>
                {stageOptions.map((stage) => {
                  const isSelected = selectedStage === stage
                  const checklist = currentStepCode?.checklists?.find(
                    (stepCodeChecklist) => stepCodeChecklist.stage === stage
                  )

                  return (
                    <Tr
                      key={stage}
                      cursor="pointer"
                      bg={isSelected ? "theme.blueLight" : undefined}
                      onClick={() => handleStageSelect(stage)}
                    >
                      <Td pl={0} width="1px">
                        <Radio
                          isChecked={isSelected}
                          onChange={() => handleStageSelect(stage)}
                          aria-label={stageLabel(stage)}
                        />
                      </Td>
                      <Td fontWeight={isSelected ? "bold" : "normal"}>{stageLabel(stage)}</Td>
                      <Td pr={0} textAlign="right">
                        <Button
                          type="submit"
                          variant="primary"
                          isDisabled={!isSelected || isStageChecklistLoading}
                          isLoading={isSelected && isSubmitting}
                        >
                          {checklist
                            ? t("stepCode.projectInformation.continue")
                            : t("stepCode.projectInformation.create")}
                        </Button>
                      </Td>
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          </FormControl>
        </Flex>
      </form>
    </FormProvider>
  )
})

function getDefaultValues(currentStepCode, checklist = null): IProjectInformationForm {
  return {
    fullAddress: currentStepCode?.fullAddress || "",
    referenceNumber: currentStepCode?.referenceNumber || "",
    permitDate: currentStepCode?.permitDate || "",
    pid: currentStepCode?.pid || "",
    builder: checklist?.builder || "",
    buildingType: checklist?.buildingType ?? undefined,
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
        {tooltip && <InfoTooltip hasArrow placement="top" maxW="400px" whiteSpace="normal" label={tooltip} />}
      </HStack>
      <Input isDisabled value={value || ""} textOverflow="ellipsis" textAlign="left" />
    </FormControl>
  )
}
