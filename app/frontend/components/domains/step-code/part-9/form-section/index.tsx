import { Accordion, Alert, Center, Heading, HStack, Tag, Text, VStack } from "@chakra-ui/react"
import { LightningA } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { ReactNode, useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useParams } from "react-router-dom"
import { usePart9StepCode } from "../../../../../hooks/resources/use-part-9-step-code"
import { EFileUploadAttachmentType, EFlashMessageStatus } from "../../../../../types/enums"
import { IOption, TPart9NavLinkKey } from "../../../../../types/types"
import { FileDownloadButton } from "../../../../shared/base/file-download-button"
import { SharedSpinner } from "../../../../shared/base/shared-spinner"
import { BuildingCharacteristicsSummary } from "../checklist/building-characteristics-summary"
import { CompletedBy } from "../checklist/completed-by"
import { ComplianceSummary } from "../checklist/compliance-summary"
import { EnergyPerformanceCompliance } from "../checklist/energy-performance-compliance"
import { EnergyStepCodeCompliance } from "../checklist/energy-step-code-compliance"
import { ProjectInfo } from "../checklist/project-info"
import { StepNotMetWarning } from "../checklist/shared/step-not-met-warning"
import { ZeroCarbonStepCodeCompliance } from "../checklist/zero-carbon-step-code-compliance"
import { DrawingsWarning } from "../drawings-warning"
import { H2KImport } from "../import"
import { Info } from "../info"
import { Title } from "../title"
import { usePart9Navigation } from "../use-part-9-navigation"
import { Part9FormFooter } from "./shared/form-footer"

interface IChecklistRouteSectionProps {
  sectionKey: TPart9NavLinkKey
  requiresReport?: boolean
  children: (helpers: { checklist: NonNullable<ReturnType<typeof usePart9StepCode>["checklist"]> }) => ReactNode
}

export const FormSection = observer(function Part9StepCodeFormSection() {
  const { section } = useParams()

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
      return <ProjectInfoSection />
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

const ProjectInfoSection = observer(function ProjectInfoSection() {
  const { currentStepCode, checklist } = usePart9StepCode()
  const { permitApplicationId } = useParams()
  const formMethods = useForm({ mode: "onChange" })
  const { handleSubmit, reset, formState } = formMethods
  const isEditable = !permitApplicationId

  useEffect(() => {
    if (!checklist) return
    if (checklist.isLoaded) return
    ;(async () => {
      await checklist.load()
    })()
  }, [checklist?.id, checklist?.isLoaded])

  useEffect(() => {
    if (!checklist?.isLoaded) return

    const site: IOption | null = checklist.fullAddress
      ? {
          label: checklist.fullAddress,
          value: null,
        }
      : null

    reset({
      ...checklist.defaultFormValues,
      fullAddress: checklist.fullAddress || "",
      pid: checklist.pid || "",
      jurisdictionId: currentStepCode?.jurisdiction?.id || "",
      site,
    })
  }, [checklist?.id, checklist?.isLoaded, currentStepCode?.jurisdiction?.id])

  const onSubmit = async (values) => {
    if (!checklist || !currentStepCode) throw new Error("Save failed")

    const checklistValues = { ...values }
    const { fullAddress, jurisdictionId, pid } = checklistValues
    delete checklistValues.fullAddress
    delete checklistValues.jurisdictionId
    delete checklistValues.pid
    delete checklistValues.site

    if (isEditable) {
      const stepCodeUpdated = await currentStepCode.update({
        fullAddress,
        jurisdictionId,
        pid,
        referenceNumber: values.referenceNumber,
      })
      if (!stepCodeUpdated) throw new Error("Save failed")
    }

    const result = await checklist.update({
      ...checklistValues,
      stepRequirementId: checklist.stepRequirementId,
    })
    if (!result) throw new Error("Save failed")

    const sectionCompleted = await checklist.completeSection("projectInfo")
    if (!sectionCompleted) throw new Error("Save failed")
  }

  if (!currentStepCode || !checklist?.isLoaded) {
    return (
      <Center>
        <SharedSpinner />
      </Center>
    )
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Accordion allowMultiple defaultIndex={[0]}>
          <ProjectInfo
            checklist={checklist}
            isEditable={isEditable}
            initialJurisdiction={currentStepCode?.jurisdiction}
          />
        </Accordion>
        <Part9FormFooter
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          isDisabled={(isEditable && !formState.isValid) || formState.isSubmitting}
          isLoading={formState.isSubmitting}
        />
      </form>
    </FormProvider>
  )
})

const ChecklistRouteSection = observer(function ChecklistRouteSection({
  sectionKey,
  requiresReport,
  children,
}: IChecklistRouteSectionProps) {
  const { currentStepCode, checklist } = usePart9StepCode()
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

const ComplianceSummarySection = observer(function ComplianceSummarySection({ checklist }) {
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
  const formMethods = useForm({ mode: "onChange" })
  const { handleSubmit, formState } = formMethods

  const onSubmit = async () => {
    const updated = await checklist.completeSection("review")
    if (!updated) throw new Error("Save failed")
  }

  if (!checklist) return <SharedSpinner />
  if (!checklist.selectedReport) return <MissingReportSection />

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack align="start" spacing={6}>
          <Heading as="h2" fontSize="2xl">
            {t("stepCode.part9.sidebar.review")}
          </Heading>
          <HStack spacing={5}>
            <Text fontWeight="bold">{t("stepCodeChecklist.edit.heading")}</Text>
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
          <Text>{t("stepCode.subTitle")}</Text>
          <Part9FormFooter handleSubmit={handleSubmit} onSubmit={onSubmit} isLoading={formState.isSubmitting} />
        </VStack>
      </form>
    </FormProvider>
  )
})

const ReportSection = observer(function ReportSection() {
  const { currentStepCode, checklist } = usePart9StepCode()
  const formMethods = useForm({ mode: "onChange" })
  const { handleSubmit, formState } = formMethods

  const onSubmit = async () => {
    const updated = await checklist.completeSection("report")
    if (!updated) throw new Error("Save failed")
  }

  if (!checklist) return <SharedSpinner />
  if (!checklist.selectedReport) return <MissingReportSection />

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack align="start" spacing={6}>
          <Heading as="h2" fontSize="2xl">
            {t("stepCode.part9.sidebar.report")}
          </Heading>
          <Text>{t("stepCodeChecklist.pdf.for", { address: checklist.fullAddress })}</Text>
          {currentStepCode?.latestReportDocument && (
            <FileDownloadButton
              variant="link"
              modelType={EFileUploadAttachmentType.ReportDocument}
              document={currentStepCode.latestReportDocument as any}
              simpleLabel
            />
          )}
          <Part9FormFooter handleSubmit={handleSubmit} onSubmit={onSubmit} isLoading={formState.isSubmitting} />
        </VStack>
      </form>
    </FormProvider>
  )
})
