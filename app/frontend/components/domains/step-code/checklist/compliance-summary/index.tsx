import {
  Alert,
  Box,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Heading,
  Link,
  Text,
  VStack,
  styled,
} from "@chakra-ui/react"
import { ArrowSquareOut, WarningCircle } from "@phosphor-icons/react"
import { CalendarBlank } from "@phosphor-icons/react/dist/ssr"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React from "react"
import { Trans } from "react-i18next"
import { IStepCodeChecklist } from "../../../../../models/step-code-checklist"
import { TextFormControl } from "../../../../shared/form/input-form-control"
import { ChecklistSection } from "../shared/checklist-section"
import { EnergySteps } from "./energy-steps"
import { i18nPrefix } from "./i18n-prefix"
import { StepRequirementRadioGroup } from "./step-requirement-radio-group"
import { ZeroCarbonSteps } from "./zero-carbon-steps"
interface IProps {
  checklist: IStepCodeChecklist
}

export const ComplianceSummary = observer(function ComplianceSummary({ checklist }: IProps) {
  const report = checklist.selectedReport

  return (
    <ChecklistSection heading={t(`${i18nPrefix}.heading`)}>
      <TextFormControl
        label={t(`${i18nPrefix}.compliancePath.label`)}
        inputProps={{
          isDisabled: true,
          value: t(`${i18nPrefix}.compliancePath.options.${checklist.compliancePath}`),
        }}
      />

      {checklist.complianceReports.length > 1 && (
        <VStack gap={4} borderWidth={1} p={4} rounded="sm" borderColor="border.light" align="start" w="full">
          <Heading as="h3" fontSize="lg" mb={0}>
            {t(`${i18nPrefix}.stepRequirement.heading`)}
          </Heading>
          <FormControl w="auto">
            <FormLabel>{t(`${i18nPrefix}.stepRequirement.label`)}</FormLabel>
            <StepRequirementRadioGroup checklist={checklist} />
            <FormHelperText>
              <Trans
                i18nKey={`${i18nPrefix}.stepRequirement.helpText`}
                components={{
                  1: <Link href={t("stepCode.helpLink")} isExternal></Link>,
                  2: <ArrowSquareOut />,
                }}
              />
            </FormHelperText>
          </FormControl>
          {R.isNil(report.energy.proposedStep) && (
            <Alert
              status="error"
              rounded="lg"
              borderWidth={1}
              borderColor="semantic.error"
              bg="semantic.errorLight"
              gap={2}
              color="text.primary"
              fontSize="xs"
            >
              <WarningCircle color="var(--chakra-colors-semantic-error)" />
              {t(`stepCodeChecklist.edit.energyStepNotMet`)}
            </Alert>
          )}
          {R.isNil(report.zeroCarbon.proposedStep) && (
            <Alert
              status="error"
              rounded="lg"
              borderWidth={1}
              borderColor="semantic.error"
              bg="semantic.errorLight"
              gap={2}
              color="text.primary"
              fontSize="xs"
            >
              <WarningCircle color="var(--chakra-colors-semantic-error)" />
              {t(`stepCodeChecklist.edit.zeroCarbonStepNotMet`)}
            </Alert>
          )}
        </VStack>
      )}

      {/* Step Requirements */}
      <HStack spacing={6} w="full" align="stretch">
        {/* Energy */}
        <VStack flex={1} spacing={4} borderWidth={1} borderColor="border.light" rounded="sm" p={4}>
          <Heading as="h3" mb={0} fontSize="lg">
            {t(`${i18nPrefix}.energyStepCode.heading`)}
          </Heading>

          <VStack align="stretch">
            <Text fontSize="md" color="text.primary">
              {t(`${i18nPrefix}.energyStepCode.stepRequired`) + ": "}
            </Text>
            <StepBox>{t(`${i18nPrefix}.energyStepCode.steps.${report.energy.requiredStep}`)}</StepBox>
          </VStack>

          <VStack flex={1} justify="end" w="full">
            <EnergySteps compliance={report.energy} />

            <VStack>
              <Text fontSize="md">{t(`${i18nPrefix}.energyStepCode.stepProposed`) + ": "}</Text>
              <StepBox
                bg={report.energy.proposedStep ? "semantic.successLight" : "semantic.errorLight"}
                w="full"
                minH={"39px"}
              >
                {report.energy.proposedStep
                  ? t(`${i18nPrefix}.energyStepCode.steps.${report.energy.proposedStep}`)
                  : t(`${i18nPrefix}.notMet`)}
              </StepBox>
            </VStack>
          </VStack>
        </VStack>

        {/* Zero Carbon */}
        <VStack flex={1} spacing={4} borderWidth={1} borderColor="border.light" rounded="sm" p={4}>
          <Heading as="h3" mb={0} fontSize="md">
            {t(`${i18nPrefix}.zeroCarbonStepCode.heading`)}
          </Heading>

          <VStack align="center">
            <Text>{t(`${i18nPrefix}.zeroCarbonStepCode.stepRequired`) + ": "}</Text>
            <StepBox>{t(`${i18nPrefix}.zeroCarbonStepCode.steps.${report.zeroCarbon.requiredStep}`)}</StepBox>
          </VStack>

          <VStack flex={1} justify="end" w="full">
            <ZeroCarbonSteps compliance={report.zeroCarbon} />

            <VStack>
              <Text fontSize="md">{t(`${i18nPrefix}.zeroCarbonStepCode.stepProposed`) + ": "}</Text>
              <StepBox bg={report.zeroCarbon.proposedStep ? "semantic.successLight" : "semantic.errorLight"} w="full">
                {report.zeroCarbon.proposedStep
                  ? t(`${i18nPrefix}.zeroCarbonStepCode.steps.${report.zeroCarbon.proposedStep}`)
                  : t(`${i18nPrefix}.notMet`)}
              </StepBox>
            </VStack>
          </VStack>
        </VStack>
      </HStack>

      <Divider />

      {/* Plan Info */}
      <VStack align="start" w="full">
        <Text fontWeight="bold" fontSize="md">
          {t(`${i18nPrefix}.planInfo.title`)}
        </Text>
        <HStack w="full">
          <TextFormControl
            label={t(`${i18nPrefix}.planInfo.author`)}
            inputProps={{ isDisabled: true, value: checklist.planAuthor || "" }}
          />
          <TextFormControl
            label={t(`${i18nPrefix}.planInfo.version`)}
            inputProps={{ isDisabled: true, value: checklist.planVersion || "" }}
          />
          <TextFormControl
            label={t(`${i18nPrefix}.planInfo.date`)}
            inputProps={{ isDisabled: true, value: checklist.planDate || "" }}
            leftElement={<CalendarBlank />}
          />
        </HStack>
      </VStack>
    </ChecklistSection>
  )
})

const StepBox = styled(Box)
StepBox.defaultProps = {
  textAlign: "center",
  rounded: "md",
  bg: "semantic.infoLight",
  px: 3,
  py: 1.5,
  fontWeight: "bold",
  fontSize: "lg",
}
