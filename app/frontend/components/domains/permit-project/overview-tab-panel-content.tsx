import { Box, Button, Flex, Grid, Heading, HStack, Icon, Text, VStack } from "@chakra-ui/react"
import { CaretRight, Info, Plus, SquaresFour, Steps } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitProject } from "../../../models/permit-project"
import { EProjectPermitApplicationSortFields } from "../../../types/enums"
import { CopyLinkButton } from "../../shared/base/copy-link-button"
import { SearchGrid } from "../../shared/grid/search-grid"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { PermitApplicationGridHeaders } from "./permit-application-grid-headers"
import { PermitApplicationGridRow } from "./permit-application-grid-row"

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

export const OverviewTabPanelContent = observer(({ permitProject }: IProps) => {
  const { fullAddress, pid, jurisdiction, projectNumber } = permitProject
  const { t } = useTranslation()

  return (
    <Flex direction="column" flex={1} bg="greys.white" p={10}>
      <Box as="section" mb={10}>
        <HStack align="center" spacing={4} mb={6}>
          <SquaresFour size={32} />
          <Heading as="h2" size="lg" mb={0}>
            {t("permitProject.overview.title")}
          </Heading>
        </HStack>
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={10}>
          <Box>
            <Heading as="h3" size="md" mb={6}>
              {t("permitProject.overview.projectInformation")}
            </Heading>

            <ProjectInfoRow
              label={t("permitProject.overview.address")}
              value={fullAddress || t("permitProject.overview.notAvailable")}
              isCopyable
            />
            <ProjectInfoRow label={t("permitProject.overview.number")} value={projectNumber} isCopyable />
            <ProjectInfoRow
              label={t("permitProject.overview.pid")}
              value={pid || t("permitProject.overview.notAvailable")}
              subLabel={t("permitProject.overview.parcelIdentifier")}
              isCopyable
            />

            <VStack align="flex-start" spacing={4} mt={8}>
              <RouterLinkButton variant="link" to={`/jurisdictions/${jurisdiction?.id}`} leftIcon={<Info size={24} />}>
                {t("permitProject.overview.checkPermitNeeds")}
              </RouterLinkButton>
              <RouterLinkButton
                variant="link"
                to={`/jurisdictions/${jurisdiction?.id}/step-code-requirements`}
                leftIcon={<Steps size={24} />}
              >
                {t("permitProject.overview.lookupStepCode")}
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
            {t("permitProject.overview.recentPermits")}
          </Heading>
          <Button variant="primary" leftIcon={<Icon as={Plus} />}>
            {t("permitProject.overview.addPermit")}
          </Button>
        </Flex>
        <SearchGrid templateColumns="2fr 1.5fr 1.5fr 1.5fr 0.5fr" gridRowClassName="permit-application-grid-row">
          <PermitApplicationGridHeaders
            columns={Object.values(EProjectPermitApplicationSortFields)}
            includeActionColumn
          />
          {permitProject.recentPermitApplications.map((permitApplication) => (
            <PermitApplicationGridRow key={permitApplication.id} permitApplication={permitApplication} />
          ))}
        </SearchGrid>
        <Flex justify="flex-end" mt={4}>
          <RouterLinkButton
            variant="tertiary"
            rightIcon={<CaretRight />}
            to={`/permit-projects/${permitProject.id}/permits`}
          >
            {t("permitProject.overview.allPermits")}
          </RouterLinkButton>
        </Flex>
      </Box>
    </Flex>
  )
})
