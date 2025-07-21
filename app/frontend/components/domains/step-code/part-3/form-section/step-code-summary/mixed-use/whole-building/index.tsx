import { Flex, FormLabel } from "@chakra-ui/react"
import { t } from "i18next"
import * as R from "ramda"
import React from "react"
import { usePart3StepCode } from "../../../../../../../../hooks/resources/use-part-3-step-code"
import { BaselineWholeBuildingSummary } from "./baseline"
import { StepCodeWholeBuildingSummary } from "./step-code"

export const WholeBuildingPerformance = function MixedUseWholeBuildingPerformanceResults() {
  const i18nPrefix = "stepCode.part3.stepCodeSummary.mixedUse.wholeBuilding"
  const { checklist } = usePart3StepCode()
  const isBaseline = R.isEmpty(checklist.stepCodeOccupancies)

  return (
    <Flex direction="column" gap={2}>
      <FormLabel>{t(`${i18nPrefix}.title`)}</FormLabel>
      {isBaseline ? <BaselineWholeBuildingSummary /> : <StepCodeWholeBuildingSummary />}
    </Flex>
  )
}
