import { Tag, TagProps } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { EProjectState } from "../../../types/enums"

const projectStateBgMap: Record<string, string> = {
  [EProjectState.draft]: "greys.grey04",
  [EProjectState.queued]: "greys.grey04",
  [EProjectState.waiting]: "greys.grey04",
  [EProjectState.inProgress]: "semantic.warningLight",
  [EProjectState.ready]: "semantic.successLight",
  [EProjectState.permitIssued]: "semantic.successLight",
  [EProjectState.active]: "semantic.warningLight",
  [EProjectState.complete]: "semantic.successLight",
  [EProjectState.closed]: "greys.grey04",
}

const projectStateBorderColorMap: Record<string, string> = {
  [EProjectState.draft]: "border.light",
  [EProjectState.queued]: "border.light",
  [EProjectState.waiting]: "border.light",
  [EProjectState.inProgress]: "semantic.warning",
  [EProjectState.ready]: "semantic.success",
  [EProjectState.permitIssued]: "semantic.success",
  [EProjectState.active]: "semantic.warning",
  [EProjectState.complete]: "semantic.success",
  [EProjectState.closed]: "border.light",
}

interface IProjectStateTagProps extends TagProps {
  state: string
  [key: string]: unknown
}

export const ProjectStateTag = React.forwardRef<HTMLSpanElement, IProjectStateTagProps>(({ state, ...rest }, ref) => {
  const { t } = useTranslation()

  return (
    <Tag.Root
      ref={ref}
      p={1}
      bg={projectStateBgMap[state] || "greys.grey04"}
      color="text.primary"
      fontWeight="medium"
      border="1px solid"
      borderColor={projectStateBorderColorMap[state] || "border.light"}
      textTransform="capitalize"
      minW="fit-content"
      textAlign="center"
      {...rest}
    >
      {/* @ts-ignore */}
      {t(`submissionInbox.projectStates.${state}`)}
    </Tag.Root>
  )
})
