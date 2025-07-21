import { Button, Flex, FormControl, FormHelperText, Heading, Input, Text } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
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
  const isBaseline = R.isEmpty(checklist.stepCodeOccupancies)

  const { handleSubmit, formState } = useForm()
  const { isSubmitting } = formState

  const onSubmit = async () => {
    if (!checklist) return

    const alternatePath = checklist.alternateNavigateAfterSavePath
    checklist.setAlternateNavigateAfterSavePath(null)

    const updateSucceeded = await checklist.completeSection("stepCodeSummary")

    if (updateSucceeded) {
      if (alternatePath) {
        navigate(alternatePath)
      } else if (permitApplicationId) {
        permitApplicationId && navigate(`/permit-applications/${permitApplicationId}/edit`)
      } else {
        navigate(`/step-codes`)
      }
    } else {
      console.error("Failed to complete stepCodeSummary section")
    }
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
      <form onSubmit={handleSubmit(onSubmit)} name="part3SectionForm">
        <FormControl>
          <Button type="submit" variant="primary" isLoading={isSubmitting} isDisabled={isSubmitting}>
            {t(`${i18nPrefix}.cta`)}
          </Button>
        </FormControl>
      </form>
    </Flex>
  )
})

FormHelperText.defaultProps = { fontSize: "md", mb: 1 }
Input.defaultProps = { textAlign: "center" }
