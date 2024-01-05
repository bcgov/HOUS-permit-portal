import { observer } from "mobx-react-lite"
import React from "react"
import { useMst } from "../../../setup/root"
import { EUserRoles } from "../../../types/enums"
import { ReviewManagerHomeScreen } from "./review-manager-home-screen"
import { ReviewerHomeScreen } from "./reviewer-home-screen"
import { SubmitterHomeScreen } from "./submitter-home-screen"
import { SuperAdminHomeScreen } from "./super-admin-home-screen"

const roleSpecificScreens = (role: EUserRoles, props: IHomeScreenProps) => {
  return {
    [EUserRoles.superAdmin]: <SuperAdminHomeScreen {...props} />,
    [EUserRoles.reviewer]: <ReviewerHomeScreen {...props} />,
    [EUserRoles.reviewManager]: <ReviewManagerHomeScreen {...props} />,
    [EUserRoles.submitter]: <SubmitterHomeScreen {...props} />,
  }[role]
}

export interface IHomeScreenProps {}

export const HomeScreen = observer(({ ...props }: IHomeScreenProps) => {
  const { userStore } = useMst()
  const { currentUser } = userStore

  return roleSpecificScreens(currentUser.role, props)
})
