import { Tag, TagProps } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { EPermitApplicationStatus } from "../../../types/enums"

export const applicationStatusBgMap: Record<string, string> = {
  [EPermitApplicationStatus.newlySubmitted]: "theme.yellow",
  [EPermitApplicationStatus.resubmitted]: "theme.yellow",
  [EPermitApplicationStatus.inReview]: "theme.blueLight",
  [EPermitApplicationStatus.newDraft]: "theme.blueLight",
  [EPermitApplicationStatus.revisionsRequested]: "semantic.errorLight",
  [EPermitApplicationStatus.approved]: "semantic.successLight",
  [EPermitApplicationStatus.issued]: "semantic.successLight",
  [EPermitApplicationStatus.withdrawn]: "greys.grey04",
  [EPermitApplicationStatus.ephemeral]: "theme.blueLight",
}

export const applicationStatusColorMap: Record<string, string> = {
  [EPermitApplicationStatus.newlySubmitted]: "text.primary",
  [EPermitApplicationStatus.resubmitted]: "text.primary",
  [EPermitApplicationStatus.inReview]: "text.primary",
  [EPermitApplicationStatus.newDraft]: "text.primary",
  [EPermitApplicationStatus.revisionsRequested]: "semantic.error",
  [EPermitApplicationStatus.approved]: "semantic.success",
  [EPermitApplicationStatus.issued]: "semantic.success",
  [EPermitApplicationStatus.withdrawn]: "text.secondary",
  [EPermitApplicationStatus.ephemeral]: "text.primary",
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
        color={applicationStatusColorMap[status] || "text.secondary"}
        fontWeight="bold"
        border="1px solid"
        borderColor="border.light"
        textTransform="uppercase"
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
