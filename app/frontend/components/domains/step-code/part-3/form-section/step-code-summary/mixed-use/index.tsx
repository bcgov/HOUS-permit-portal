import { Flex } from "@chakra-ui/react"
import * as R from "ramda"
import React from "react"
import { usePart3StepCode } from "../../../../../../../hooks/resources/use-part-3-step-code"
import { StepCodeOccupanciesPerformance } from "./step-code-occupancies"
import { StepCodePortionsPerformance } from "./step-code-portions"
import { WholeBuildingPerformance } from "./whole-building"

export const MixedUsePerformance = function MixedUsePerformanceResults() {
  const { checklist } = usePart3StepCode()

  return (
    <Flex direction="column" gap={4}>
      <WholeBuildingPerformance />
      {!R.isEmpty(checklist.stepCodeOccupancies) && <StepCodePortionsPerformance />}
      <StepCodeOccupanciesPerformance />
    </Flex>
  )
}
