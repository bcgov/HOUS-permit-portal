import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react"
import { Info, Plus, SquaresFour, Steps } from "@phosphor-icons/react"
import { format } from "date-fns"
import React from "react"
import { IPermitProject } from "../../../models/permit-project"
import { CopyLinkButton } from "../../shared/base/copy-link-button"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { PermitApplicationRow } from "../../shared/permit-applications/permit-application-row"

const ProjectInfoRow = ({ label, value, subLabel = null, isCopyable = false }) => (
  <Flex
    justify="space-between"
    align="center"
    py={2}
    borderBottom="1px"
    borderColor="border.light"
    _last={{ borderBottom: "none" }}
    w="full"
  >
    <Flex justify="space-between" align="center" w="full" mr={2}>
      <VStack align="flex-start" spacing={0}>
        <Text>{label}</Text>
        {subLabel && (
          <Text fontSize="sm" color="text.secondary">
            {subLabel}
          </Text>
        )}
      </VStack>
      <Text>{value}</Text>
    </Flex>
    {isCopyable && <CopyLinkButton value={value} iconOnly />}
  </Flex>
)

interface IProps {
  permitProject: IPermitProject
}

export const OverviewTabPanelContent = ({ permitProject }: IProps) => {
  const { fullAddress, pid, createdAt, jurisdiction, projectNumber } = permitProject

  return (
    <Flex direction="column" flex={1} bg="greys.white" p={10}>
      <Box as="section" mb={10}>
        <HStack align="center" spacing={4} mb={6}>
          <SquaresFour size={32} />
          <Heading as="h2" size="lg" mb={0}>
            Overview
          </Heading>
        </HStack>
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={10}>
          <Box>
            <Heading as="h3" size="md" mb={6}>
              Project information
            </Heading>

            <ProjectInfoRow label="Address" value={fullAddress || "Not available"} isCopyable />
            <ProjectInfoRow label="Number" value={projectNumber} isCopyable />
            <ProjectInfoRow label="PID" value={pid || "Not available"} subLabel="Parcel identifier" isCopyable />
            <ProjectInfoRow label="Project created date" value={format(createdAt, "MMM d, yyyy")} />

            <VStack align="flex-start" spacing={4} mt={8}>
              <RouterLinkButton variant="link" to={`/jurisdictions/${jurisdiction?.id}`} leftIcon={<Info size={24} />}>
                Check what's needed to apply for permits in this community
              </RouterLinkButton>
              <RouterLinkButton
                variant="link"
                to={`/jurisdictions/${jurisdiction?.id}/step-code-requirements`}
                leftIcon={<Steps size={24} />}
              >
                Look up Energy Step Code and Zero Carbon Step Code requirements
              </RouterLinkButton>
            </VStack>
          </Box>
          <Box>
            {/* TODO: Add map */}
            {/* <Image src="/images/map-placeholder.png" alt="Parcel map" borderRadius="md" />
              <Icon as={MapPin} mr={2} />
              Open parcel map
            </Link> */}
          </Box>
        </Grid>
      </Box>

      <Box as="section">
        <Flex justify="space-between" align="center" mb={6}>
          <Heading as="h3" size="md">
            Recent permits
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
            {permitProject.recentPermitApplications.map((permitApplication) => (
              <PermitApplicationRow key={permitApplication.id} permitApplication={permitApplication} />
            ))}
          </Tbody>
        </Table>
        <Flex justify="flex-end" mt={4}>
          <RouterLinkButton to={`/permit-projects/${permitProject.id}/permits`}>All permits</RouterLinkButton>
        </Flex>
      </Box>
    </Flex>
  )
}
