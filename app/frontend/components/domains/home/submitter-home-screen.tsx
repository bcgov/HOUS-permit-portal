import { Container } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IHomeScreenProps } from "."
import { useMst } from "../../../setup/root"

export const SubmitterHomeScreen = observer(({ ...rest }: IHomeScreenProps) => {
  const { t } = useTranslation()
  const {} = useMst()

  return <Container>submitter home</Container>
})
