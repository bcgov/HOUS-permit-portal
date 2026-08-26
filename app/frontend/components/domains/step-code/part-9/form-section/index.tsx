import {
  Accordion,
  Alert,
  Button,
  Center,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  InputGroup,
  Tag,
  Text,
  VStack,
} from "@chakra-ui/react"
import { LightningA, PaperPlaneRight } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { ReactNode, useEffect, useState } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom"
import { usePart9StepCode } from "../../../../../hooks/resources/use-part-9-step-code"
import { EFileUploadAttachmentType, EFlashMessageStatus } from "../../../../../types/enums"
import { TPart9NavLinkKey } from "../../../../../types/types"
import { FileDownloadButton } from "../../../../shared/base/file-download-button"
import { SharedSpinner } from "../../../../shared/base/shared-spinner"
import { ConfirmationModal } from "../../../../shared/confirmation-modal"
import { TextFormControl } from "../../../../shared/form/input-form-control"
import { BuildingCharacteristicsSummary } from "../checklist/building-characteristics-summary"
import { CompletedBy } from "../checklist/completed-by"
import { ComplianceSummary } from "../checklist/compliance-summary"
import { EnergyPerformanceCompliance } from "../checklist/energy-performance-compliance"
import { EnergyStepCodeCompliance } from "../checklist/energy-step-code-compliance"
import { BuildingTypeSelect } from "../checklist/project-info/building-type-select"
import { StepNotMetWarning } from "../checklist/shared/step-not-met-warning"
import { ZeroCarbonStepCodeCompliance } from "../checklist/zero-carbon-step-code-compliance"
import { DrawingsWarning } from "../drawings-warning"
import { H2KImport } from "../import"
import { Info } from "../info"
import { Title } from "../title"
import { usePart9Navigation } from "../use-part-9-navigation"
import { Part9FormFooter } from "./shared/form-footer"

type TPart9Checklist = NonNullable<ReturnType<typeof usePart9StepCode>["checklist"]>

interface IChecklistRouteSectionProps {
  sectionKey: TPart9NavLinkKey
  requiresReport?: boolean
  children: (helpers: { checklist: TPart9Checklist }) => ReactNode
}

interface IComplianceSummarySectionProps {
  checklist: TPart9Checklist
}

export const FormSection = observer(function Part9StepCodeFormSection() {
  const { section } = useParams()
  const { pathname } = useLocation()

  useEffect(() => {
    const scroller = document.getElementById("stepCodeScroll")
    if (scroller) {
      scroller.scrollTo({ top: 0, left: 0, behavior: "auto" })
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" })
    }
  }, [section])

  switch (section) {
    case "start":
      return <StartSection />
    case "project-info":
      return <Navigate to={pathname.replace(/\/project-info$/, "/start")} replace />
    case "building-info":
      return <BuildingInfoSection />
    case "h2k-import":
      return <H2KImport />
    case "compliance-summary":
      return (
        <ChecklistRouteSection sectionKey="complianceSummary" requiresReport>
          {({ checklist }) => <ComplianceSummarySection checklist={checklist} />}
        </ChecklistRouteSection>
      )
    case "completed-by":
      return (
        <ChecklistRouteSection sectionKey="completedBy" requiresReport>
          {({ checklist }) => <CompletedBy checklist={checklist} />}
        </ChecklistRouteSection>
      )
    case "building-characteristics":
      return (
        <ChecklistRouteSection sectionKey="buildingCharacteristics" requiresReport>
          {({ checklist }) => <BuildingCharacteristicsSummary checklist={checklist} />}
        </ChecklistRouteSection>
      )
    case "energy-performance":
      return (
        <ChecklistRouteSection sectionKey="energyPerformance" requiresReport>
          {({ checklist }) => <EnergyPerformanceCompliance compliance={checklist.selectedReport.energy} />}
        </ChecklistRouteSection>
      )
    case "energy-step-compliance":
      return (
        <ChecklistRouteSection sectionKey="energyStepCompliance" requiresReport>
          {({ checklist }) => <EnergyStepCodeCompliance compliance={checklist.selectedReport.energy} />}
        </ChecklistRouteSection>
      )
    case "zero-carbon-compliance":
      return (
        <ChecklistRouteSection sectionKey="zeroCarbonCompliance" requiresReport>
          {({ checklist }) => <ZeroCarbonStepCodeCompliance compliance={checklist.selectedReport.zeroCarbon} />}
        </ChecklistRouteSection>
      )
    case "review":
      return <ReviewSection />
    case "report":
      return <ReportSection />
  }
})

const StartSection = observer(function StartSection() {
  const { checklist } = usePart9StepCode()
  const { permitApplicationId } = useParams()
  const formMethods = useForm({ mode: "onChange" })
  const { handleSubmit, formState } = formMethods

  const onSubmit = async () => {
    const updated = await checklist.completeSection("start")
    if (!updated) throw new Error("Save failed")
  }

  if (!checklist) return <SharedSpinner />

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={8} align="start" w="full" pb={20}>
          <Title />
          <Info />
          {permitApplicationId && <DrawingsWarning />}
          <Part9FormFooter handleSubmit={handleSubmit} onSubmit={onSubmit} isLoading={formState.isSubmitting} />
        </VStack>
      </form>
    </FormProvider>
  )
})

const BuildingInfoSection = observer(function BuildingInfoSection() {
  const { checklist } = usePart9StepCode()
  const formMethods = useForm({ mode: "onChange" })
  const { control, handleSubmit, reset, formState } = formMethods
  const { errors } = formState

  useEffect(() => {
    if (!checklist) return
    if (checklist.isLoaded) return
    ;(async () => {
      await checklist.load()
    })()
  }, [checklist?.id, checklist?.isLoaded])

  useEffect(() => {
    if (!checklist?.isLoaded) return
    reset(checklist.defaultFormValues)
  }, [checklist?.id, checklist?.isLoaded])

  const onSubmit = async (values) => {
    const result = await checklist.update({
      builder: values.builder,
      buildingType: values.buildingType,
    })
    if (!result) throw new Error("Save failed")

    const sectionCompleted = await checklist.completeSection("buildingInfo")
    if (!sectionCompleted) throw new Error("Save failed")
  }

  if (!checklist?.isLoaded) {
    return (
      <Center>
        <SharedSpinner />
      </Center>
    )
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack align="start" spacing={6}>
          <Heading as="h2" fontSize="2xl">
            {t("stepCode.part9.buildingInfo.heading")}
          </Heading>
          <Text>{t("stepCode.part9.buildingInfo.instructions")}</Text>
          <TextFormControl label={t("stepCodeChecklist.edit.projectInfo.builder")} fieldName="builder" required />
          <FormControl isInvalid={!!errors.buildingType}>
            <HStack gap={0}>
              <FormLabel>
                {t("stepCodeChecklist.edit.projectInfo.buildingType.label")}
                <Text as="span" color="semantic.error" ml={1}>
                  *
                </Text>
              </FormLabel>
            </HStack>
            <InputGroup>
              <Controller
                control={control}
                name="buildingType"
                rules={{
                  required: t("ui.isRequired", {
                    field: t("stepCodeChecklist.edit.projectInfo.buildingType.label"),
                  }),
                }}
                render={({ field: { onChange, value } }) => (
                  <BuildingTypeSelect onChange={onChange} value={value} isInvalid={!!errors.buildingType} />
                )}
              />
            </InputGroup>
            <FormErrorMessage>{errors.buildingType?.message as string}</FormErrorMessage>
          </FormControl>
          <Part9FormFooter handleSubmit={handleSubmit} onSubmit={onSubmit} isLoading={formState.isSubmitting} />
        </VStack>
      </form>
    </FormProvider>
  )
})

const ChecklistRouteSection = observer(function ChecklistRouteSection({
  sectionKey,
  requiresReport,
  children,
}: IChecklistRouteSectionProps) {
  const { checklist } = usePart9StepCode()
  const formMethods = useForm({ mode: "onChange" })
  const { handleSubmit, reset, formState } = formMethods

  useEffect(() => {
    if (!checklist) return
    if (checklist.isLoaded) return
    ;(async () => {
      await checklist.load()
    })()
  }, [checklist?.id, checklist?.isLoaded])

  useEffect(() => {
    if (!checklist?.isLoaded) return
    reset(checklist.defaultFormValues)
  }, [checklist?.id, checklist?.isLoaded])

  const onSubmit = async (values) => {
    const result = await checklist.update({
      ...values,
      stepRequirementId: checklist.stepRequirementId,
    })
    if (!result) throw new Error("Save failed")

    const sectionCompleted = await checklist.completeSection(sectionKey)
    if (!sectionCompleted) throw new Error("Save failed")
  }

  if (!checklist?.isLoaded) {
    return (
      <Center>
        <SharedSpinner />
      </Center>
    )
  }

  if (requiresReport && !checklist.selectedReport) {
    return <MissingReportSection />
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Accordion allowMultiple defaultIndex={[0]}>
          {children({ checklist })}
        </Accordion>
        <Part9FormFooter handleSubmit={handleSubmit} onSubmit={onSubmit} isLoading={formState.isSubmitting} />
      </form>
    </FormProvider>
  )
})

const ComplianceSummarySection = observer(function ComplianceSummarySection({
  checklist,
}: IComplianceSummarySectionProps) {
  const { navigateToSection } = usePart9Navigation()

  return (
    <>
      {checklist.selectedReport && (
        <VStack spacing={2} align="stretch" pb={4}>
          {checklist.selectedReport.energy?.proposedStep == null && (
            <StepNotMetWarning
              i18nKey="energyStepNotMet"
              scrollToSection={() => navigateToSection("energyStepCompliance")}
            />
          )}
          {checklist.selectedReport.zeroCarbon?.proposedStep == null && (
            <StepNotMetWarning
              i18nKey="zeroCarbonStepNotMet"
              scrollToSection={() => navigateToSection("zeroCarbonCompliance")}
            />
          )}
          <Alert
            status={EFlashMessageStatus.info}
            rounded="lg"
            borderWidth={1}
            borderColor="semantic.info"
            bg="semantic.infoLight"
            gap={2}
            color="text.primary"
          >
            <LightningA color="var(--chakra-colors-semantic-info)" />
            {t("stepCodeChecklist.edit.notice")}
          </Alert>
        </VStack>
      )}
      <ComplianceSummary
        checklist={checklist}
        scrollToEnergyCompliance={() => navigateToSection("energyStepCompliance")}
        scrollToZeroCarbonCompliance={() => navigateToSection("zeroCarbonCompliance")}
      />
    </>
  )
})

const MissingReportSection = function MissingReportSection() {
  return (
    <VStack align="start" spacing={4}>
      <Heading as="h2" fontSize="2xl">
        {t("stepCode.import.title")}
      </Heading>
      <Text>{t("stepCode.import.lockedUntilH2k")}</Text>
    </VStack>
  )
}

const ReviewSection = observer(function ReviewSection() {
  const { checklist } = usePart9StepCode()
  const { pathname } = useLocation()
  const formMethods = useForm({ mode: "onChange" })
  const { handleSubmit, formState } = formMethods

  const onSubmit = async () => {
    const updated = await checklist.completeSection("review")
    if (!updated) throw new Error("Save failed")
  }

  if (!checklist) return <SharedSpinner />
  if (!checklist.selectedReport) return <MissingReportSection />
  if (!checklist.canAccessReview) {
    const target = checklist.currentNavLink?.location ?? "start"
    return <Navigate to={pathname.replace(/\/review$/, `/${target}`)} replace />
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack align="start" spacing={6}>
          <Heading as="h2" fontSize="2xl">
            {t("stepCode.part9.sidebar.review")}
          </Heading>
          <Text>{t("stepCode.part9.review.description")}</Text>
          <Text>{t("stepCode.part9.review.reportGenerationDescription")}</Text>
          <HStack spacing={5}>
            <Text fontWeight="bold">{t("stepCode.part9.review.statusLabel")}</Text>
            <Tag
              p={1}
              bg={checklist.isMarkedComplete ? "theme.blue" : "greys.grey03"}
              color={checklist.isMarkedComplete ? "greys.white" : "text.primary"}
              fontWeight="bold"
              border="1px solid"
              borderColor="border.base"
              textTransform="uppercase"
              minW="fit-content"
            >
              {checklist.status}
            </Tag>
          </HStack>
          <Part9FormFooter
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            isLoading={formState.isSubmitting}
            generatesReport
          />
        </VStack>
      </form>
    </FormProvider>
  )
})

const ReportSection = observer(function ReportSection() {
  const { checklist, currentStepCode } = usePart9StepCode()
  const { pathname } = useLocation()
  const { exitLinkPath } = usePart9Navigation()
  const navigate = useNavigate()
  const formMethods = useForm({ mode: "onChange" })
  const { handleSubmit, formState } = formMethods
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const freshReport = checklist?.freshReportDocument

  useEffect(() => {
    if (freshReport) setIsRegenerating(false)
  }, [freshReport])

  const onSubmit = async () => {
    const updated = await checklist.completeSection("report")
    if (!updated) throw new Error("Save failed")
  }

  const handleSaveAndExit = handleSubmit(async () => {
    await onSubmit()
    navigate(exitLinkPath)
  })

  const handleRegenerateReport = async () => {
    setIsRegenerating(true)
    try {
      const updated = await checklist.regenerateReport()
      if (!updated) setIsRegenerating(false)
    } catch {
      setIsRegenerating(false)
    }
  }

  const handleShare = async () => {
    const reportId = checklist?.freshReportDocument?.id
    if (!reportId) return
    setIsSharing(true)
    try {
      await currentStepCode?.shareReportWithJurisdiction(reportId)
    } finally {
      setIsSharing(false)
    }
  }

  if (!checklist) return <SharedSpinner />
  if (!checklist.selectedReport) return <MissingReportSection />
  if (!checklist.canAccessReport) {
    const target = checklist.currentNavLink?.location ?? "start"
    return <Navigate to={pathname.replace(/\/report$/, `/${target}`)} replace />
  }

  const isStale = !!checklist.reportDocument?.stale && !freshReport
  const canShare = !!freshReport && !!currentStepCode?.jurisdiction
  const reportStatusKey = freshReport ? "ready" : isStale ? "stale" : "missing"

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack align="start" spacing={6}>
          <Heading as="h2" fontSize="2xl">
            {t("stepCode.part9.sidebar.report")}
          </Heading>
          {!freshReport && <Text>{t("stepCode.part9.report.description")}</Text>}
          {!isRegenerating && (
            <Text>
              {reportStatusKey === "ready"
                ? t("stepCode.part9.report.ready", { address: checklist.fullAddress })
                : t(`stepCode.part9.report.${reportStatusKey}`)}
            </Text>
          )}
          <VStack align="start" spacing={3}>
            <Flex gap={3} align="center" wrap="wrap">
              {freshReport && (
                <FileDownloadButton
                  variant="secondary"
                  size="md"
                  modelType={EFileUploadAttachmentType.ReportDocument}
                  document={freshReport as any}
                  simpleLabel
                />
              )}
              {canShare && (
                <ConfirmationModal
                  title={t("stepCode.shareReport.confirmTitle")}
                  body={t("stepCode.shareReport.confirmBody")}
                  onConfirm={async (closeModal) => {
                    await handleShare()
                    closeModal()
                  }}
                  renderTriggerButton={(props) => (
                    <Button
                      {...props}
                      type="button"
                      variant="secondary"
                      size="md"
                      leftIcon={<PaperPlaneRight size={16} />}
                      isLoading={isSharing}
                    >
                      {t("stepCode.shareReport.action")}
                    </Button>
                  )}
                  renderConfirmationButton={(props) => (
                    <Button {...props} variant="primary" isLoading={isSharing}>
                      {t("stepCode.shareReport.confirm")}
                    </Button>
                  )}
                />
              )}
              <Button
                type="button"
                variant="primary"
                onClick={handleSaveAndExit}
                isLoading={formState.isSubmitting}
                isDisabled={!checklist.canMarkComplete}
              >
                {t("stepCode.saveAndExit")}
              </Button>
            </Flex>
            <Button type="button" variant="link" onClick={handleRegenerateReport} isLoading={isRegenerating}>
              {t("stepCode.regenerateReport")}
            </Button>
          </VStack>
        </VStack>
      </form>
    </FormProvider>
  )
})
