import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { IHomeScreenProps } from "."
import { useMst } from "../../../setup/root"
import { LoadingScreen } from "../../shared/base/loading-screen"

export const ReviewerHomeScreen = observer(({ ...rest }: IHomeScreenProps) => {
  // Currently this home screen redirects the user to the submission inbox
  // This approach is necessary as the page already exists at the jurisdictions/${jurisdiction.slug}/submission-inbox
  // route for review_managers, and it wouldn't make sense to have a page exist at two routes at once.
  // (base url for links, dependence on jurisdiction ID param, etc.)
  // Plus this leaves a starting point in case we want to add more screens for reviewers later.

  const {
    userStore: {
      currentUser: { jurisdiction },
    },
  } = useMst()
  const navigate = useNavigate()

  useEffect(() => {
    if (!jurisdiction?.id) return

    navigate(`jurisdictions/${jurisdiction.slug}/submission-inbox`)
  }, [jurisdiction])

  if (!jurisdiction) return <LoadingScreen />
  return <></>
})
