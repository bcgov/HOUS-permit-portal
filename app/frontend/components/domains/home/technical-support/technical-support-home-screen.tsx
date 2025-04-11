import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { IHomeScreenProps } from ".."
import { useMst } from "../../../../setup/root"
import { LoadingScreen } from "../../../shared/base/loading-screen"

export const TechnicalSupportHomeScreen = observer(({ ...rest }: IHomeScreenProps) => {
  
  const {
    userStore: {
      currentUser: { jurisdiction },
    },
  } = useMst()
  const navigate = useNavigate()

  useEffect(() => {
    if (!jurisdiction?.id) return

    navigate(`jurisdictions/${jurisdiction.slug}/configuration-management`)
  }, [jurisdiction])

  if (!jurisdiction) return <LoadingScreen />
  return <></>
})
