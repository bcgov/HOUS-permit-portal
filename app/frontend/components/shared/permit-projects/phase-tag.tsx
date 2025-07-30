import { Icon, Tag, Text } from "@chakra-ui/react"
import { CheckCircle, CircleDashed, Clock, Empty, FlagBanner, IconProps } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { EPermitProjectPhase } from "../../../types/enums"

interface IProps {
  phase: EPermitProjectPhase
}

const phaseToIconMap: Record<EPermitProjectPhase, React.ElementType<IconProps>> = {
  [EPermitProjectPhase.newDraft]: CircleDashed,
  [EPermitProjectPhase.newlySubmitted]: Clock,
  [EPermitProjectPhase.revisionsRequested]: FlagBanner,
  [EPermitProjectPhase.resubmitted]: Clock,
  [EPermitProjectPhase.approved]: CheckCircle,
  [EPermitProjectPhase.empty]: Empty,
}

export const PhaseTag = ({ phase }: IProps) => {
  const { t } = useTranslation()
  const IconComponent = phaseToIconMap[phase]

  return (
    <Tag bg="transparent" p={0}>
      <Icon as={IconComponent} mr={2} />
      <Text>{t(`permitProject.phase.${phase}`)}</Text>
    </Tag>
  )
}
