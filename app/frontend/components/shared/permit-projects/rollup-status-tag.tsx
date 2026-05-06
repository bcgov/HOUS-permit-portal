import { Icon, Tag, Text } from "@chakra-ui/react"
import { CheckCircle, CircleDashed, Clock, Empty, FlagBanner, IconProps } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { EPermitProjectRollupStatus } from "../../../types/enums"

interface IProps {
  rollupStatus: EPermitProjectRollupStatus
}

const rollupStatusToIconMap: Record<EPermitProjectRollupStatus, React.ElementType<IconProps>> = {
  [EPermitProjectRollupStatus.newDraft]: CircleDashed,
  [EPermitProjectRollupStatus.newlySubmitted]: Clock,
  [EPermitProjectRollupStatus.revisionsRequested]: FlagBanner,
  [EPermitProjectRollupStatus.resubmitted]: Clock,
  [EPermitProjectRollupStatus.approved]: CheckCircle,
  [EPermitProjectRollupStatus.empty]: Empty,
}

export const RollupStatusTag = ({ rollupStatus }: IProps) => {
  const { t } = useTranslation()
  const IconComponent = rollupStatusToIconMap[rollupStatus]

  return (
    <Tag.Root bg="transparent" p={0}>
      <Icon mr={2} asChild>
        <IconComponent />
      </Icon>
      <Text>{t(`permitProject.rollupStatus.${rollupStatus}`)}</Text>
    </Tag.Root>
  )
}
