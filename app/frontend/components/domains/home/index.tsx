import { observer } from "mobx-react-lite"
import React from "react"
import { useMst } from "../../../setup/root"
import { EUserRoles } from "../../../types/enums"
import { PermitProjectIndexScreen } from "../permit-project"
import { ReviewManagerHomeScreen } from "./review-manager"
import { ReviewerHomeScreen } from "./reviewer-home-screen"
import { SuperAdminHomeScreen } from "./super-admin-home-screen"
import { TechnicalSupportHomeScreen } from "./technical-support"

const roleSpecificScreens = (role: EUserRoles, props: IHomeScreenProps) => {
  return {
    [EUserRoles.superAdmin]: <SuperAdminHomeScreen {...props} />,
    [EUserRoles.reviewer]: <ReviewerHomeScreen {...props} />,
    [EUserRoles.reviewManager]: <ReviewManagerHomeScreen {...props} />,
    [EUserRoles.regionalReviewManager]: <ReviewManagerHomeScreen {...props} />,
    [EUserRoles.submitter]: <PermitProjectIndexScreen {...props} />,
    [EUserRoles.technicalSupport]: <TechnicalSupportHomeScreen {...props} />,
  }[role]
}

export interface IHomeScreenProps {}

export const HomeScreen = observer(({ ...props }: IHomeScreenProps) => {
  const { userStore } = useMst()
  const { currentUser } = userStore

  return roleSpecificScreens(currentUser.role, props)
})
