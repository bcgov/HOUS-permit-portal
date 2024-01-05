import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IHomeScreenProps } from "."
import { useMst } from "../../../setup/root"
import { FullWhiteContainer } from "../../shared/containers/full-white-container"

export const SubmitterHomeScreen = observer(({ ...rest }: IHomeScreenProps) => {
  const { t } = useTranslation()
  const {} = useMst()

  return <FullWhiteContainer>submitter home</FullWhiteContainer>
})
