import { Flex, FormControl, FormLabel, HStack, Input } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React from "react"
import { usePart3StepCode } from "../../../../../../../hooks/resources/use-part-3-step-code"
import { BaselineEnergyPerformance } from "./baseline-occupancy/energy"
import { BaselineZeroCarbonPerformance } from "./baseline-occupancy/zero-carbon"
import { MixedUseEnergyPerformance } from "./mixed-use/energy"
import { MixedUseZeroCarbonPerformance } from "./mixed-use/zero-carbon"
import { StepCodeEnergyPerformance } from "./step-code-occupancy/energy"
import { StepCodeZeroCarbonPerformance } from "./step-code-occupancy/zero-carbon"

const i18nPrefix = "stepCode.part3.stepCodeSummary.stepCode"

export const StepCodePerformance = observer(function StepCodePerformanceResults() {
  const { checklist } = usePart3StepCode()
  const isMixedUse = checklist.stepCodeOccupancies.length > 1 || checklist.baselineOccupancies.length > 1
  const isBaseline = R.isEmpty(checklist.stepCodeOccupancies)

  let occupancyName: string
  if (!isMixedUse) {
    if (isBaseline) {
      occupancyName = t(`stepCode.part3.baselineOccupancyKeys.${checklist.baselineOccupancies[0].key}`)
    } else {
      occupancyName = t(`stepCode.part3.stepCodeOccupancyKeys.${checklist.stepCodeOccupancies[0].key}`)
    }
  }

  return (
    <Flex direction="column" gap={4}>
      <FormControl>
        <FormLabel fontWeight="normal">{t(`${i18nPrefix}.compliancePath`)}</FormLabel>
        <Input
          isDisabled
          textAlign="left"
          value={t(`stepCode.part3.projectDetails.buildingCodeVersions.${checklist.buildingCodeVersion}`)}
        />
      </FormControl>

      <FormControl>
        <FormLabel fontWeight="normal">{t(`${i18nPrefix}.stepCodeOccupancy.label`)}</FormLabel>
        <Input isDisabled textAlign="left" value={occupancyName || t(`${i18nPrefix}.stepCodeOccupancy.mixedUse`)} />
      </FormControl>

      <HStack spacing={6} w="full" align="stretch">
        {isBaseline ? (
          <>
            <BaselineEnergyPerformance />
            <BaselineZeroCarbonPerformance />
          </>
        ) : isMixedUse ? (
          <>
            <MixedUseEnergyPerformance />
            <MixedUseZeroCarbonPerformance />
          </>
        ) : (
          <>
            <StepCodeEnergyPerformance />
            <StepCodeZeroCarbonPerformance />
          </>
        )}
      </HStack>
    </Flex>
  )
})
