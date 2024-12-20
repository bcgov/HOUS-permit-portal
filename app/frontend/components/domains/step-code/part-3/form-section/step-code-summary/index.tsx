import { Flex, FormHelperText, Heading, Input, Text } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useForm } from "react-hook-form"
import { Trans } from "react-i18next"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { usePart3StepCode } from "../../../../../../hooks/resources/use-part-3-step-code"
import { RouterLink } from "../../../../../shared/navigation/router-link"
import { SectionHeading } from "../shared/section-heading"
import { MixedUsePerformance } from "./mixed-use"
import { StepCodePerformance } from "./step-code-performance"

export const StepCodeSummary = observer(function StepCodeSummary() {
  const i18nPrefix = "stepCode.part3.stepCodeSummary"
  const { checklist } = usePart3StepCode()
  const { permitApplicationId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isMixedUse = checklist.stepCodeOccupancies.length + checklist.baselineOccupancies.length > 1
  const isBaseline = checklist.stepCodeOccupancies.length == 0

  const { handleSubmit, formState } = useForm()
  const { isSubmitting } = formState

  const onSubmit = async () => {
    await checklist.completeSection("requirementsSummary")

    navigate(`permit-applications/${permitApplicationId}/edit`)
  }

  const stepCodeOccupanciesPath = checklist.isComplete("stepCodeOccupancies")
    ? "step-code-performance-requirements"
    : "step-code-occupancies"
  const baselineOccupanciesPath = checklist.isComplete("baselineOccupancies")
    ? "baseline-details"
    : "baseline-occupancies"

  return !checklist.canShowResults ? (
    <Flex direction="column" gap={6}>
      <SectionHeading>{t(`${i18nPrefix}.stepCode.heading`)}</SectionHeading>
      <Flex direction="column" gap={4} p={4} bg="theme.blueLight" color="theme.blueAlt" rounded="lg" w="full">
        <Heading variant="heading4">{t(`${i18nPrefix}.missingInfo.title`)}</Heading>
        <Text>
          <Trans
            i18nKey={`${i18nPrefix}.missingInfo.message`}
            components={{
              baselineOccupanciesLink: (
                <RouterLink to={`${location.pathname.replace("requirements-summary", baselineOccupanciesPath)}`} />
              ),
              stepCodeOccupanciesLink: (
                <RouterLink to={`${location.pathname.replace("requirements-summary", stepCodeOccupanciesPath)}`} />
              ),
            }}
          />
        </Text>
      </Flex>
    </Flex>
  ) : (
    <Flex direction="column" gap={6} rounded="lg" borderWidth={1} borderColor="greys.grey02" py={3} px={6}>
      <Flex direction="column" gap={4}>
        <SectionHeading>{t(`${i18nPrefix}.stepCode.heading`)}</SectionHeading>
        <StepCodePerformance />
      </Flex>
      {(isMixedUse || isBaseline) && (
        <Flex direction="column" gap={2}>
          <SectionHeading>{t(`${i18nPrefix}.mixedUse.heading`)}</SectionHeading>
          <MixedUsePerformance />
        </Flex>
      )}
    </Flex>
  )
})

FormHelperText.defaultProps = { fontSize: "md", mb: 1 }
Input.defaultProps = { textAlign: "center" }
