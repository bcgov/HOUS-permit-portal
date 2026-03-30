import { Tag, TagProps } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { EPermitApplicationStatus, EProjectState } from "../../../types/enums"

export const applicationStatusBgMap: Record<string, string> = {
  [EPermitApplicationStatus.newDraft]: "greys.grey04",
  [EPermitApplicationStatus.newlySubmitted]: "semantic.infoLight",
  [EPermitApplicationStatus.inReview]: "semantic.warningLight",
  [EPermitApplicationStatus.revisionsRequested]: "semantic.errorLight",
  [EPermitApplicationStatus.resubmitted]: "semantic.infoLight",
  [EPermitApplicationStatus.approved]: "semantic.successLight",
  [EPermitApplicationStatus.issued]: "semantic.successLight",
  [EPermitApplicationStatus.withdrawn]: "greys.grey04",
  [EPermitApplicationStatus.ephemeral]: "theme.blueLight",

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
  [EPermitApplicationStatus.resubmitted]: "semantic.info",
  [EPermitApplicationStatus.approved]: "semantic.success",
  [EPermitApplicationStatus.issued]: "semantic.success",
  [EPermitApplicationStatus.withdrawn]: "border.light",
  [EPermitApplicationStatus.ephemeral]: "border.light",

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
