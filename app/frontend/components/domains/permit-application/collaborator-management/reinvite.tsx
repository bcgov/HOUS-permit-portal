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
  const isConfirmedUser =
    !permitCollaboration.collaborator.user?.isDiscarded && !permitCollaboration.collaborator.user?.isUnconfirmed
  const isEligibleForReinvite = permitCollaboration.collaborator.user?.isSubmitter
  return isConfirmedUser ? null : (
    <Text fontSize={"xs"} color={"text.secondary"} ml={2}>
      {isEligibleForReinvite ? (
        <>
          {t("permitCollaboration.popover.collaborations.unconfirmed")}
          <RequestLoadingButton
            onClick={onReinvite ? () => onReinvite(permitCollaboration.id) : undefined}
            variant={"link"}
            fontStyle={"italic"}
          >
            {t("permitCollaboration.popover.collaborations.resendInvite")}
          </RequestLoadingButton>
        </>
      ) : (
        t("permitCollaboration.popover.collaborations.inEligibleForReInvite")
      )}
    </Text>
  )
})
