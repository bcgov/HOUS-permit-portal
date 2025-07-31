import { CheckCircle, CircleDashed, Clock, Empty, FlagBanner, IconProps } from "@phosphor-icons/react"
import React from "react"
import { EPermitProjectPhase } from "../../../types/enums"

interface IProps {
  phase: EPermitProjectPhase
  iconProps?: IconProps
}

const phaseToIconMap: Record<EPermitProjectPhase, React.ElementType<IconProps>> = {
  [EPermitProjectPhase.newDraft]: CircleDashed,
  [EPermitProjectPhase.newlySubmitted]: Clock,
  [EPermitProjectPhase.revisionsRequested]: FlagBanner,
  [EPermitProjectPhase.resubmitted]: Clock,
  [EPermitProjectPhase.approved]: CheckCircle,
  [EPermitProjectPhase.empty]: Empty,
}
export function PhaseIcon({ phase, iconProps }: IProps) {
  const Icon = phaseToIconMap[phase]
  return Icon ? <Icon size={24} {...iconProps} /> : null
}
