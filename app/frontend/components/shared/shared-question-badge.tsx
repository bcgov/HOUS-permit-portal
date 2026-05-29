import { Tag, TagProps, Tooltip } from "@chakra-ui/react"
import { LinkSimple } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { EQuestionReviewState } from "../../types/enums"

interface ISharedQuestionBadgeProps extends TagProps {
  reviewState?: string | null
}

const reviewStateColor = (reviewState?: string | null): { bg: string; color: string } => {
  switch (reviewState) {
    case EQuestionReviewState.approved:
      return { bg: "semantic.successLight", color: "text.secondary" }
    case EQuestionReviewState.deprecated:
      return { bg: "semantic.errorLight", color: "text.secondary" }
    default:
      return { bg: "theme.blueLight", color: "text.secondary" }
  }
}

// Marks a placement that inherits its content from a shared QuestionDefinition.
export const SharedQuestionBadge: React.FC<ISharedQuestionBadgeProps> = ({ reviewState, ...rest }) => {
  const { t } = useTranslation()
  const { bg, color } = reviewStateColor(reviewState)

  const stateLabel = reviewState ? t(`requirementsLibrary.questionBank.reviewState.${reviewState}` as any) : null

  return (
    <Tooltip label={t("requirementsLibrary.questionBank.sharedTooltip" as any)}>
      <Tag bg={bg} color={color} fontWeight={700} fontSize={"xs"} gap={1} {...rest}>
        <LinkSimple size={12} weight="bold" />
        {t("requirementsLibrary.questionBank.shared" as any)}
        {stateLabel ? ` · ${stateLabel}` : ""}
      </Tag>
    </Tooltip>
  )
}
