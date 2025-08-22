import { CheckCircle, CircleDashed, Clock, FlagBanner, FolderDashed, IconProps } from "@phosphor-icons/react"
import React from "react"
import { EPermitProjectRollupStatus } from "../../../types/enums"

interface IProps {
  rollupStatus: EPermitProjectRollupStatus
  iconProps?: IconProps
}

const rollupStatusToIconMap: Record<EPermitProjectRollupStatus, React.ElementType<IconProps>> = {
  [EPermitProjectRollupStatus.newDraft]: CircleDashed,
  [EPermitProjectRollupStatus.newlySubmitted]: Clock,
  [EPermitProjectRollupStatus.revisionsRequested]: FlagBanner,
  [EPermitProjectRollupStatus.resubmitted]: Clock,
  [EPermitProjectRollupStatus.approved]: CheckCircle,
  [EPermitProjectRollupStatus.empty]: FolderDashed,
}
export function RollupStatusIcon({ rollupStatus, iconProps }: IProps) {
  const Icon = rollupStatusToIconMap[rollupStatus]
  return Icon ? <Icon size={24} {...iconProps} /> : null
}
