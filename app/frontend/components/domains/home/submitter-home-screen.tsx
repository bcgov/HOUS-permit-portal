import { Container, Heading } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IHomeScreenProps } from "."
import { useMst } from "../../../setup/root"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"

export const SubmitterHomeScreen = observer(({ ...rest }: IHomeScreenProps) => {
  const { t } = useTranslation()
  const {} = useMst()

  return (
    <Container>
      <div>Submitter Home</div>

      <RouterLinkButton to={`/permit-applications`} variant="tertiary">
        <Heading as="h3" fontSize="lg" color="text.link">
          Permit Applications
        </Heading>
      </RouterLinkButton>
    </Container>
  )
})
