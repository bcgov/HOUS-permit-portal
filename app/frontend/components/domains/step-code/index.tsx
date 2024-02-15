import { Container, Heading, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { NewStepCodeForm } from "./new"

export const StepCodeChecklistsScreen = observer(function StepCodeChecklists() {
  return (
    <Container>
      <Heading>Step Code Checklists</Heading>
      <VStack>{/* TODO: list existing checklists */}</VStack>
      <NewStepCodeForm />
    </Container>
  )
})
