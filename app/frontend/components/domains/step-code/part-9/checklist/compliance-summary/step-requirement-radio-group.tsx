import { Radio, RadioGroup } from "@/components/ui/radio"
import { Grid, Tag } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { IPart9StepCodeChecklist } from "../../../../../../models/part-9-step-code-checklist"
import { i18nPrefix } from "./i18n-prefix"

interface IProps {
  checklist: IPart9StepCodeChecklist
}
export const StepRequirementRadioGroup = observer(function StepRequirementRadioSelect({ checklist }: IProps) {
  const { complianceReports, stepRequirementId, setSelectedReport } = checklist

  return (
    <RadioGroup.Root
      defaultValue={stepRequirementId}
      value={stepRequirementId}
      onValueChange={(val) => setSelectedReport(val)}
    >
      <Grid templateColumns="repeat(4, auto)" gap={4} color="text.secondary">
        <GridItem />
        <GridItem color="text.primary" fontSize="sm" mx="auto">
          {t(`${i18nPrefix}.energyStepRequired`)}
        </GridItem>
        <GridItem />
        <GridItem color="text.primary" fontSize="sm" mx="auto">
          {t(`${i18nPrefix}.zeroCarbonStepRequired`)}
        </GridItem>

        {complianceReports.map((report, index) => (
          <>
            <GridItem mx="auto">
              <Radio key={index} value={report.requirementId}></Radio>
            </GridItem>
            <GridItem mx="auto">
              <Tag.Root
                bg={report.energy.proposedStep ? "semantic.successLight" : "semantic.errorLight"}
                color="inherit"
                rounded="xs"
                fontWeight="bold"
              >
                {report.energy.requiredStep
                  ? t(`${i18nPrefix}.energyStepCode.steps.${report.energy.requiredStep}`)
                  : t(`${i18nPrefix}.notRequired`)}
              </Tag.Root>
            </GridItem>
            <GridItem fontStyle="italic" fontWeight="bold" fontSize="sm" px={4} mx="auto">
              {t(`ui.and`)}
            </GridItem>
            <GridItem mx="auto">
              <Tag.Root
                bg={report.zeroCarbon.proposedStep ? "semantic.successLight" : "semantic.errorLight"}
                color="inherit"
                rounded="xs"
                fontWeight="bold"
              >
                {report.zeroCarbon.requiredStep
                  ? t(
                      `home.configurationManagement.stepCodeRequirements.stepRequired.zeroCarbon.options.${report.zeroCarbon.requiredStep}`
                    )
                  : t(`${i18nPrefix}.notRequired`)}
              </Tag.Root>
            </GridItem>
          </>
        ))}
      </Grid>
    </RadioGroup.Root>
  )
})
