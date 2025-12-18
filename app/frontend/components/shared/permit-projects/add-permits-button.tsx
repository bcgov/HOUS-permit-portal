import { Icon } from "@chakra-ui/react"
import { Plus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitProject } from "../../../models/permit-project"
import { ConditionalTooltip } from "../conditional-tooltip"
import { RouterLinkButton } from "../navigation/router-link-button"

interface IProps {
  permitProject: IPermitProject
}

export const AddPermitsButton = observer(({ permitProject }: IProps) => {
  const { t } = useTranslation()
  const isDisabled = permitProject.jurisdictionDifferentFromSandbox

  const preventWhenDisabled = (e: React.MouseEvent) => {
    if (isDisabled) e.preventDefault()
  }

  const button = (
    <RouterLinkButton
      variant="primary"
      leftIcon={<Icon as={Plus} />}
      to={`/projects/${permitProject.id}/add-permits`}
      isDisabled={isDisabled}
      onClick={preventWhenDisabled}
    >
      {t("permitProject.addPermits.button")}
    </RouterLinkButton>
  )

  return (
    <ConditionalTooltip
      showTooltip={isDisabled}
      message={t("permitProject.addPermits.sandboxWarning")}
      tooltipProps={{ openDelay: 200, placement: "top" }}
    >
      {button}
    </ConditionalTooltip>
  )
})
