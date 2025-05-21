import { Box, Heading, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useParams } from "react-router-dom"
import { usePermitProject } from "../../../hooks/resources/use-permit-project"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"
// import { useMst } from "../../../setup/root"; // Uncomment when ready to fetch data

export const PermitProjectScreen = observer(() => {
  const { permitProjectId } = useParams<{ permitProjectId: string }>()
  // const { permitProjectStore } = useMst(); // Uncomment when ready to fetch data

  const { currentPermitProject, error } = usePermitProject()

  if (error) return <ErrorScreen error={error} />
  if (!currentPermitProject) return <LoadingScreen />

  return (
    <Box p={5}>
      <Heading as="h1" size="xl" mb={6}>
        Permit Project Details
      </Heading>
      <Box borderWidth="1px" borderRadius="lg" p={6}>
        <Heading as="h3" size="md" mb={3}>
          ID: {currentPermitProject.id}
        </Heading>
        <Text>
          <strong>Description:</strong> {currentPermitProject.description}
        </Text>
        {/* TODO: Display other project details here */}
      </Box>
    </Box>
  )
})
