import { Container } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useJurisdiction } from "../../../hooks/resources/use-jurisdiction"
import { useMst } from "../../../setup/root"

export type TCreateJurisdictionFormData = {
  name: string
  localityType: string
}

export const JurisdictionConfigurationScreen = observer(() => {
  const { t } = useTranslation()
  const { currentJurisdiction, error } = useJurisdiction()
  const { jurisdictionStore } = useMst()

  return (
    <Container maxW="container.lg" p={8} as="main">
      TODO
    </Container>
  )
})
