import { Container, Heading } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"

export const SuccessfulSubmissionScreen = observer(() => {
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
