import { Field, Flex, Heading, Input, Text } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useForm } from "react-hook-form"
import { Trans } from "react-i18next"
import { useLocation } from "react-router-dom"
import { usePart3StepCode } from "../../../../../../hooks/resources/use-part-3-step-code"
import { EPart3BuildingType } from "../../../../../../types/enums"
import { RouterLink } from "../../../../../shared/navigation/router-link"
import { Part3FormFooter } from "../shared/form-footer"
import { SectionHeading } from "../shared/section-heading"
import { BaselineRequirements } from "./baseline-requirements"
import { StepCodeRequirements } from "./step-code-requirements"
import { WholeBuildingRequirements } from "./whole-building-requirements"

export const RequirementsSummary = observer(function RequirementsSummary() {
  const i18nPrefix = "stepCode.part3.requirementsSummary"
  const { checklist } = usePart3StepCode()
  const location = useLocation()

  const { handleSubmit, formState } = useForm()
  const { isSubmitting } = formState

  const stepCodeOccupanciesPath = checklist.isComplete("stepCodeOccupancies")
    ? "step-code-performance-requirements"
    : "step-code-occupancies"
  const baselineOccupanciesPath = checklist.isComplete("baselineOccupancies")
    ? "baseline-details"
    : "baseline-occupancies"

  const onSubmit = async () => {
    if (!checklist) return
    const updated = await checklist.completeSection("requirementsSummary")
    if (!updated) throw new Error("Save failed")
  }

  return (
    <Flex direction="column" gap={6}>
      <SectionHeading>{t(`${i18nPrefix}.heading`)}</SectionHeading>
      <Flex direction="column" gap={6} pb={4}>
        {!checklist.canShowResults ? (
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
        ) : (
          <>
            <Field.Root>
              <Field.Label>{t(`${i18nPrefix}.buildingType.label`)}</Field.Label>
              <Field.HelperText mb={1} mt={0}>
                {t(`${i18nPrefix}.buildingType.hint`)}
              </Field.HelperText>
              <Input
                disabled
                textAlign="left"
                value={t(`${i18nPrefix}.buildingType.options.${checklist.buildingType}`)}
              />
            </Field.Root>

            {checklist.buildingType == EPart3BuildingType.baseline && (
              <>
                <BaselineRequirements />
                <WholeBuildingRequirements />
              </>
            )}
            {checklist.buildingType == EPart3BuildingType.stepCode && (
              <>
                <StepCodeRequirements />
                <WholeBuildingRequirements />
              </>
            )}
            {checklist.buildingType == EPart3BuildingType.mixedUse && (
              <>
                <BaselineRequirements isMixedUse />
                <StepCodeRequirements />
                <WholeBuildingRequirements isMixedUse />
              </>
            )}

            <Field.Root>
              <Field.Label>{t(`${i18nPrefix}.confirm.label`)}</Field.Label>
              <Part3FormFooter handleSubmit={handleSubmit} onSubmit={onSubmit} loading={isSubmitting} />
              <Field.HelperText mt={6}>{t(`${i18nPrefix}.help`)}</Field.HelperText>
            </Field.Root>
          </>
        )}
      </Flex>
    </Flex>
  )
})

FormHelperText.defaultProps = { fontSize: "md", mb: 1 }
Input.defaultProps = { textAlign: "center" }
