import { Container, Heading } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"

export const SuccessfulSubmissionScreen = observer(({}) => {
  const { t } = useTranslation()
  const {} = useMst()

  return (
    <Container>
      <Heading>Submission success!</Heading>

      <RouterLinkButton to={`/permit-applications`} variant="tertiary">
        <Heading as="h3" fontSize="lg" color="text.link">
          Permit Applications
        </Heading>
      </RouterLinkButton>
    </Container>
  )
})
