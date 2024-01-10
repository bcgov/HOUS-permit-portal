import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IContact } from "../../../types/types"
import { FullWhiteContainer } from "../../shared/containers/full-white-container"
export interface Jurisdiction {
  name: string
  contacts: IContact[]
}

export const NewJurisdictionScreen = observer(() => {
  const { t } = useTranslation()

  return <FullWhiteContainer>hey</FullWhiteContainer>
})
