import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { EUserRoles } from "../../../types/enums"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { ReviewManagerHomeScreen } from "./review-manager-home-screen"
import { ReviewerHomeScreen } from "./reviewer-home-screen"
import { SuperAdminHomeScreen } from "./super-admin-home-screen"

const roleSpecificScreens = (role: EUserRoles, props: IHomeScreenProps) => {
  return {
    [EUserRoles.superAdmin]: <SuperAdminHomeScreen {...props} />,
    [EUserRoles.reviewer]: <ReviewerHomeScreen {...props} />,
    [EUserRoles.reviewManager]: <ReviewManagerHomeScreen {...props} />,
    [EUserRoles.submitter]: <SharedSpinner />,
  }[role]
}

export interface IHomeScreenProps {}

export const HomeScreen = observer(({ ...props }: IHomeScreenProps) => {
  const navigate = useNavigate()

  useEffect(() => {
    if (currentUser.role === EUserRoles.submitter) navigate("/permit-applications")
  }, [])

  const { userStore } = useMst()
  const { currentUser } = userStore

  return roleSpecificScreens(currentUser.role, props)
})
