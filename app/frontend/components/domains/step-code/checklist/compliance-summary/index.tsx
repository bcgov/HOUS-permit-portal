import { Box, Divider, HStack, Heading, Text, VStack, styled } from "@chakra-ui/react"
import { CalendarBlank } from "@phosphor-icons/react/dist/ssr"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useFormContext } from "react-hook-form"
import { IStepCodeChecklist } from "../../../../../models/step-code-checklist"
import { TextFormControl } from "../../../../shared/form/input-form-control"
import { ChecklistSection } from "../shared/checklist-section"
import { EnergySteps } from "./energy-steps"
import { translationPrefix } from "./translation-prefix"
import { ZeroCarbonSteps } from "./zero-carbon-steps"

interface IProps {
  checklist: IStepCodeChecklist
}

export const ComplianceSummary = observer(function ComplianceSummary({ checklist }: IProps) {
  const { control } = useFormContext()

  return (
    <ChecklistSection heading={t(`${translationPrefix}.heading`)}>
      <TextFormControl
        label={t(`${translationPrefix}.compliancePath.label`)}
        inputProps={{
          isDisabled: true,
          value: t(`${translationPrefix}.compliancePath.options.${checklist.compliancePath}`),
        }}
      />

      {/* Step Requirements */}
      <HStack spacing={6} w="full" align="stretch">
        {/* Energy */}
        <VStack flex={1} spacing={4} borderWidth={1} rounded="md" p={4}>
          <Heading as="h3" mb={0} fontSize="lg">
            {t(`${translationPrefix}.energyStepCode.heading`)}
          </Heading>

          <VStack align="stretch">
            <Text>{t(`${translationPrefix}.energyStepCode.stepRequired`) + ": "}</Text>
            <StepBox>{checklist.requiredEnergyStep}</StepBox>
          </VStack>

          <VStack flex={1} justify="end" w="full">
            <EnergySteps checklist={checklist} />

            <VStack>
              <Text fontSize="md">{t(`${translationPrefix}.energyStepCode.stepProposed`) + ": "}</Text>
              <TextFormControl
                inputProps={{
                  isDisabled: true,
                  value: checklist.proposedEnergyStep,
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              />
            </VStack>
          </VStack>
        </VStack>

        {/* Zero Carbon */}
        <VStack flex={1} spacing={4} borderWidth={1} rounded="md" p={4}>
          <Heading as="h3" mb={0} fontSize="md">
            {t(`${translationPrefix}.zeroCarbonStepCode.heading`)}
          </Heading>

          <VStack align="stretch">
            <Text>{t(`${translationPrefix}.zeroCarbonStepCode.stepRequired`) + ": "}</Text>
            <StepBox>{checklist.requiredZeroCarbonStep}</StepBox>
          </VStack>

          <VStack flex={1} justify="end" w="full">
            <ZeroCarbonSteps checklist={checklist} />

            <VStack>
              <Text fontSize="md">{t(`${translationPrefix}.zeroCarbonStepCode.stepProposed`) + ": "}</Text>
              <TextFormControl
                inputProps={{
                  isDisabled: true,
                  value: checklist.proposedZeroCarbonStep,
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              />
            </VStack>
          </VStack>
        </VStack>
      </HStack>

      <Divider />

      {/* Plan Info */}
      {/* TODO: pre-populate from application drawings */}
      <VStack align="start" w="full">
        <Text fontWeight="bold" fontSize="md">
          {t(`${translationPrefix}.planInfo.title`)}
        </Text>
        <HStack w="full">
          <TextFormControl
            label={t(`${translationPrefix}.planInfo.author`)}
            inputProps={{ isDisabled: true, value: checklist.planAuthor || "" }}
          />
          <TextFormControl
            label={t(`${translationPrefix}.planInfo.version`)}
            inputProps={{ isDisabled: true, value: checklist.planVersion || "" }}
          />
          <TextFormControl
            label={t(`${translationPrefix}.planInfo.date`)}
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
