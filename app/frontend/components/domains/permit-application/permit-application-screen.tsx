import { Container, Flex, FormControl, FormLabel, Input } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useParams } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { RequirementForm } from "../../shared/permit-applications/requirement-form"

interface IPermitApplicationScreenProps {}

export const PermitApplicationScreen = observer(({}: IPermitApplicationScreenProps) => {
  const { id } = useParams()
  const { permitApplicationStore } = useMst()
  const { getPermitApplicationById } = permitApplicationStore

  const permitApplication = getPermitApplicationById(id)
  //TODO: refactor to reusable hook to fetch permit application and give abiltiy to midyf and set things

  if (permitApplication) {
    return (
      <Flex as="main" direction="column" w="full" bg="greys.white" key={"permit-application-show"}>
        <Container maxW="container.lg" p={10}>
          <FormControl>
            <FormLabel>Permit</FormLabel>
            <Input type="text" disabled={true} value={permitApplication.permitTypeAndActivity} />
          </FormControl>
          <FormControl>
            <FormLabel>Full address</FormLabel>
            <Input type="text" disabled={true} value={permitApplication.fullAddress} />
          </FormControl>
          <FormControl>
            <FormLabel>PID / PIN</FormLabel>
            <Input type="text" disabled={true} value={permitApplication.pid || permitApplication.pin} />
          </FormControl>
        </Container>
        {permitApplication.requirements && (
          <Container maxW="container.lg">
            <RequirementForm requirements={permitApplication.requirements} />
          </Container>
        )}
      </Flex>
    )
  } else {
    return (
      <Flex as="main" direction="column" w="full" bg="greys.white" key={"permit-application-show"}>
        Loading
      </Flex>
    )
  }
})
