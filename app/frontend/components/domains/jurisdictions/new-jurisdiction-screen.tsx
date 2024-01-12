import { Container } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IContact } from "../../../types/types"
export interface Jurisdiction {
  name: string
  contacts: IContact[]
}

export const NewJurisdictionScreen = observer(() => {
  const { t } = useTranslation()

  return <Container>hey</Container>
})
