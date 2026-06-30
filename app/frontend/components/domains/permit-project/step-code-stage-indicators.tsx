import { Flex, Tooltip } from "@chakra-ui/react"
import { CheckCircle, CircleDashed } from "@phosphor-icons/react"
import { t } from "i18next"
import React from "react"
import { EStepCodeChecklistStage } from "../../../types/enums"

export const stepCodeStageOrder = [
  EStepCodeChecklistStage.preConstruction,
  EStepCodeChecklistStage.midConstruction,
  EStepCodeChecklistStage.asBuilt,
]

interface IStageCompletion {
  stage: EStepCodeChecklistStage
  complete: boolean
}

interface IProps {
  stageCompletions?: IStageCompletion[]
}

export function StepCodeStageIndicators({ stageCompletions = [] }: IProps) {
  const completionByStage = Object.fromEntries(stageCompletions.map(({ stage, complete }) => [stage, complete]))

  return (
    <Flex gap={2}>
      {stepCodeStageOrder.map((stage) => {
        const label = t(`stepCodeChecklist.edit.projectInfo.stages.${stage}`)
        const complete = completionByStage[stage]

        return (
          <Tooltip key={stage} label={label} hasArrow>
            <Flex aria-label={label}>
              {complete ? (
                <CheckCircle color="var(--chakra-colors-semantic-success)" size={18} />
              ) : (
                <CircleDashed color="var(--chakra-colors-greys-grey01)" size={18} />
              )}
            </Flex>
          </Tooltip>
        )
      })}
    </Flex>
  )
}
