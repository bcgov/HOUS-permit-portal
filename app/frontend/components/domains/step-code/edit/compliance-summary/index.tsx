import { HStack, Heading, Text, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, useFormContext } from "react-hook-form"
import { IStepCodeChecklist } from "../../../../../models/step-code-checklist"
import { TextFormControl } from "../../../../shared/form/input-form-control"
import { ChecklistSection } from "../shared/checklist-section"
import { CompliancePathSelect } from "./compliance-path-select"
import { translationPrefix } from "./translation-prefix"

interface IProps {
  checklist: IStepCodeChecklist
}

export const ComplianceSummary = observer(function ComplianceSummary({ checklist }: IProps) {
  const { control } = useFormContext()

  return (
    <ChecklistSection heading={t(`${translationPrefix}.heading`)}>
      <Controller
        control={control}
        name="compliancePath"
        render={({ field: { onChange, value } }) => <CompliancePathSelect onChange={onChange} value={value} />}
      />

      {/* Step Requirements */}
      <HStack w="full" justify="space-evenly">
        <VStack spacing={0.5}>
          <Heading as="h3" mb={0} fontSize="md">
            {t(`${translationPrefix}.energyStepCode.heading`)}
          </Heading>
          <VStack border="border.base">
            <HStack>
              <Text>{t(`${translationPrefix}.energyStepCode.stepRequired`) + ": "}</Text>
              <Text>{checklist.requiredEnergyStep}</Text>
            </HStack>
            <HStack>
              <Text>{t(`${translationPrefix}.energyStepCode.stepProposed`) + ": "}</Text>
              <Text>{checklist.proposedEnergyStep}</Text>
            </HStack>
          </VStack>
        </VStack>
        <VStack spacing={0.5}>
          <Heading as="h3" mb={0} fontSize="md">
            {t(`${translationPrefix}.zeroCarbonStepCode.heading`)}
          </Heading>
          <VStack border="border.base">
            <HStack>
              <Text>{t(`${translationPrefix}.zeroCarbonStepCode.stepRequired`) + ": "}</Text>
              <Text>{checklist.requiredZeroCarbonStep}</Text>
            </HStack>
            <HStack>
              <Text>{t(`${translationPrefix}.zeroCarbonStepCode.stepProposed`) + ": "}</Text>
              <Text>{checklist.proposedZeroCarbonStep}</Text>
            </HStack>
          </VStack>
        </VStack>
      </HStack>

      {/* Plan Info */}
      {/* TODO: pre-populate from application drawings */}
      <VStack>
        <Text>{t(`${translationPrefix}.planInfo.title`)}</Text>
        <TextFormControl label={t(`${translationPrefix}.planInfo.author`)} inputProps={{ isDisabled: true }} />
        <TextFormControl label={t(`${translationPrefix}.planInfo.version`)} inputProps={{ isDisabled: true }} />
        <TextFormControl label={t(`${translationPrefix}.planInfo.date`)} inputProps={{ isDisabled: true }} />
      </VStack>
    </ChecklistSection>
  )
})
