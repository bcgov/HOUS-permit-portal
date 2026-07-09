import { Tag, TagProps } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { EPermitApplicationStatus, EProjectState } from "../../../types/enums"

export const applicationStatusBgMap: Record<string, string> = {
  [EPermitApplicationStatus.newDraft]: "greys.grey04",
  [EPermitApplicationStatus.newlySubmitted]: "semantic.infoLight",
  [EPermitApplicationStatus.inReview]: "semantic.warningLight",
  [EPermitApplicationStatus.revisionsRequested]: "semantic.errorLight",
  [EPermitApplicationStatus.resubmitted]: "hover.blue",
  [EPermitApplicationStatus.approved]: "semantic.successLight",
  [EPermitApplicationStatus.issued]: "theme.green.100",
  [EPermitApplicationStatus.withdrawn]: "greys.grey03",
  [EPermitApplicationStatus.ephemeral]: "semantic.specialLight",

  [EProjectState.draft]: "greys.grey20",
  [EProjectState.queued]: "background.blueLightest",
  [EProjectState.waiting]: "theme.gold",
  [EProjectState.inProgress]: "theme.yellowLight",
  [EProjectState.ready]: "background.blueLight",
  [EProjectState.permitIssued]: "theme.blueLight",
  [EProjectState.active]: "greys.grey02",
  [EProjectState.complete]: "greys.white",
  [EProjectState.closed]: "darken.60",
}

export const applicationStatusColorMap: Record<string, string> = {
  [EPermitApplicationStatus.newDraft]: "text.primary",
  [EPermitApplicationStatus.newlySubmitted]: "text.primary",
  [EPermitApplicationStatus.inReview]: "text.primary",
  [EPermitApplicationStatus.revisionsRequested]: "text.primary",
  [EPermitApplicationStatus.resubmitted]: "text.primary",
  [EPermitApplicationStatus.approved]: "text.primary",
  [EPermitApplicationStatus.issued]: "text.primary",
  [EPermitApplicationStatus.withdrawn]: "text.primary",
  [EPermitApplicationStatus.ephemeral]: "text.primary",

  [EProjectState.draft]: "text.primary",
  [EProjectState.queued]: "text.primary",
  [EProjectState.waiting]: "text.primary",
  [EProjectState.inProgress]: "text.primary",
  [EProjectState.ready]: "text.primary",
  [EProjectState.permitIssued]: "text.primary",
  [EProjectState.active]: "text.primary",
  [EProjectState.complete]: "text.primary",
  [EProjectState.closed]: "text.primary",
}

export const applicationStatusBorderColorMap: Record<string, string> = {
  [EPermitApplicationStatus.newDraft]: "border.light",
  [EPermitApplicationStatus.newlySubmitted]: "semantic.info",
  [EPermitApplicationStatus.inReview]: "semantic.warning",
  [EPermitApplicationStatus.revisionsRequested]: "semantic.error",
  [EPermitApplicationStatus.resubmitted]: "border.blue",
  [EPermitApplicationStatus.approved]: "semantic.success",
  [EPermitApplicationStatus.issued]: "theme.blueAlt",
  [EPermitApplicationStatus.withdrawn]: "greys.grey01",
  [EPermitApplicationStatus.ephemeral]: "semantic.special",

  [EProjectState.draft]: "greys.grey02",
  [EProjectState.queued]: "theme.blueAlt",
  [EProjectState.waiting]: "semantic.warningDark",
  [EProjectState.inProgress]: "theme.yellow",
  [EProjectState.ready]: "border.blue",
  [EProjectState.permitIssued]: "semantic.success",
  [EProjectState.active]: "semantic.warning",
  [EProjectState.complete]: "semantic.success",
  [EProjectState.closed]: "greys.grey01",
}

interface IPermitApplicationStatusTagProps extends TagProps {
  status: string
}

export const PermitApplicationStatusTag = React.forwardRef<HTMLSpanElement, IPermitApplicationStatusTagProps>(
  ({ status, ...rest }, ref) => {
    const { t } = useTranslation()

    return (
      <Tag
        ref={ref}
        p={1}
        bg={applicationStatusBgMap[status] || "greys.grey04"}
        color={applicationStatusColorMap[status] || "text.primary"}
        fontWeight="medium"
        border="1px solid"
        borderColor={applicationStatusBorderColorMap[status] || "border.light"}
        textTransform="capitalize"
        minW="fit-content"
        textAlign="center"
        {...rest}
      >
        {/* @ts-ignore */}
        {t(`permitApplication.status.${status}`)}
      </Tag>
    )
  }
)
