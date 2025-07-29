import { Box, Button, Flex, Heading, Icon, Table, Tbody, Th, Thead, Tr } from "@chakra-ui/react"
import { Plus } from "@phosphor-icons/react"
import React from "react"
import { IPermitProject } from "../../../models/permit-project"
import { PermitApplicationRow } from "../../shared/permit-applications/permit-application-row"

interface IProps {
  permitProject: IPermitProject
}

export const PermitsTabPanelContent = ({ permitProject }: IProps) => {
  return (
    <Flex direction="column" flex={1} bg="greys.white" p={10}>
      <Box as="section">
        <Flex justify="space-between" align="center" mb={6}>
          <Heading as="h3" size="md">
            Permits
          </Heading>
          <Button variant="primary" leftIcon={<Icon as={Plus} />}>
            Add permit
          </Button>
        </Flex>
        <Table>
          <Thead>
            <Tr>
              <Th>Permit</Th>
              <Th>Assigned to</Th>
              <Th>Last modified</Th>
              <Th>Status</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {permitProject.recentPermitApplications?.map((permitApplication) => (
              <PermitApplicationRow key={permitApplication.id} permitApplication={permitApplication} />
            ))}
          </Tbody>
        </Table>
      </Box>
    </Flex>
  )
}
