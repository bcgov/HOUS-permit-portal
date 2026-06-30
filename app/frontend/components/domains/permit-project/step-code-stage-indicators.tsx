import { Flex, Popover, PopoverBody, PopoverContent, PopoverTrigger, Text, VStack } from "@chakra-ui/react"
import { CheckCircle, CircleDashed, CircleHalf } from "@phosphor-icons/react"
import { format } from "date-fns"
import { t } from "i18next"
import React from "react"
import { EStepCodeChecklistStage, EStepCodeStageStatus } from "../../../types/enums"

export const stepCodeStageOrder = [
  EStepCodeChecklistStage.preConstruction,
  EStepCodeChecklistStage.midConstruction,
  EStepCodeChecklistStage.asBuilt,
]

export interface IStageCompletion {
  stage: EStepCodeChecklistStage
  status: EStepCodeStageStatus
  stageCompletedAt: Date | null
}

interface IProps {
  stageCompletions?: IStageCompletion[]
}

function stageCompletionByStage(stageCompletions: IStageCompletion[]) {
  return Object.fromEntries(stageCompletions.map((entry) => [entry.stage, entry]))
}

export function StepCodeStageIcon({ status }: { status: EStepCodeStageStatus }) {
  if (status === EStepCodeStageStatus.complete) {
    return <CheckCircle color="var(--chakra-colors-semantic-success)" size={18} />
  }

  if (status === EStepCodeStageStatus.inProgress) {
    return <CircleHalf color="var(--chakra-colors-theme-blue)" weight="fill" size={18} />
  }

  return <CircleDashed color="var(--chakra-colors-greys-grey01)" size={18} />
}

function formatStageCompletedAt(value: Date | null) {
  return value ? format(value, "MMM d") : null
}

function stageStatusLabel(stageCompletion: IStageCompletion) {
  const { status, stageCompletedAt } = stageCompletion

  if (status === EStepCodeStageStatus.complete) {
    const completedDate = formatStageCompletedAt(stageCompletedAt)
    return completedDate
      ? t("stepCode.columns.stagesStatus.completedOn", { date: completedDate })
      : t("stepCode.columns.stagesStatus.complete")
  }

  if (status === EStepCodeStageStatus.inProgress) {
    return t("stepCode.columns.stagesStatus.inProgress")
  }

  return t("stepCode.columns.stagesStatus.notStarted")
}

function stageStatusColor(status: EStepCodeStageStatus) {
  if (status === EStepCodeStageStatus.complete) return "semantic.success"
  if (status === EStepCodeStageStatus.inProgress) return "theme.blue"
  return "text.secondary"
}

export function StepCodeStageIndicators({ stageCompletions = [] }: IProps) {
  const completionByStage = stageCompletionByStage(stageCompletions)

  return (
    <Popover trigger="hover" placement="top" openDelay={200} closeDelay={100}>
      <PopoverTrigger>
        <Flex
          gap={2}
          cursor="default"
          aria-label={t("stepCode.columns.stagesPopoverHeading")}
          onClick={(event) => event.stopPropagation()}
        >
          {stepCodeStageOrder.map((stage) => {
            const stageCompletion = completionByStage[stage] ?? {
              stage,
              status: EStepCodeStageStatus.notStarted,
              stageCompletedAt: null,
            }

            return (
              <Flex key={stage} aria-hidden>
                <StepCodeStageIcon status={stageCompletion.status} />
              </Flex>
            )
          })}
        </Flex>
      </PopoverTrigger>
      <PopoverContent w="auto" minW="240px" onClick={(event) => event.stopPropagation()}>
        <PopoverBody p={4}>
          <VStack align="stretch" spacing={3}>
            <Text
              fontSize="xs"
              fontWeight="bold"
              textTransform="uppercase"
              color="text.secondary"
              letterSpacing="wider"
            >
              {t("stepCode.columns.stagesPopoverHeading")}
            </Text>
            {stepCodeStageOrder.map((stage) => {
              const stageCompletion = completionByStage[stage] ?? {
                stage,
                status: EStepCodeStageStatus.notStarted,
                stageCompletedAt: null,
              }
              const label = t(`stepCodeChecklist.edit.projectInfo.stages.${stage}`)

              return (
                <Flex key={stage} gap={3} align="flex-start">
                  <StepCodeStageIcon status={stageCompletion.status} />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="semibold">
                      {label}
                    </Text>
                    <Text fontSize="sm" color={stageStatusColor(stageCompletion.status)}>
                      {stageStatusLabel(stageCompletion)}
                    </Text>
                  </VStack>
                </Flex>
              )
            })}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
