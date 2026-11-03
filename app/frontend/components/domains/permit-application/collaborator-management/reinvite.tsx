import { Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitCollaboration } from "../../../../models/permit-collaboration"
import { RequestLoadingButton } from "../../../shared/request-loading-button"

interface IProps {
  permitCollaboration: IPermitCollaboration
  onReinvite?: (collaborationId: string) => Promise<any>
}

export const Reinvite = observer(function Reinvite({ permitCollaboration, onReinvite }: IProps) {
  const { t } = useTranslation()
  const user = permitCollaboration.collaborator.user
  const isConfirmedUser = !user?.isDiscarded && !user?.isUnconfirmed

  // Resends the collaboration email. Account reinvite for an unconfirmed or
  // discarded reviewer is not supported here yet.
  if (isConfirmedUser) return null

  return (
    <Text fontSize={"xs"} color={"text.secondary"} ml={2}>
      {t("permitCollaboration.popover.collaborations.unconfirmed")}
      <RequestLoadingButton
        onClick={onReinvite ? () => onReinvite(permitCollaboration.id) : undefined}
        variant={"link"}
        fontStyle={"italic"}
      >
        {t("permitCollaboration.popover.collaborations.resendInvite")}
      </RequestLoadingButton>
    </Text>
  )
})
