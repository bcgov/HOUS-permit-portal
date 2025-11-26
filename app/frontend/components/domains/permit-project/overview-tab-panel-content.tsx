import { Box, Flex, Grid, Heading, HStack, Text, VStack } from "@chakra-ui/react"
import { CaretRight, Info, SquaresFour, Steps } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { IPermitProject } from "../../../models/permit-project"
import { useMst } from "../../../setup/root"
import {
  EFlashMessageStatus,
  EPermitProjectRollupStatus,
  EProjectPermitApplicationSortFields,
} from "../../../types/enums"
import { CopyLinkButton } from "../../shared/base/copy-link-button"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { EditableInputWithControls } from "../../shared/editable-input-with-controls"
import { SearchGrid } from "../../shared/grid/search-grid"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { AddPermitsButton } from "../../shared/permit-projects/add-permits-button"
import ProjectInfoRow from "../../shared/project/project-info-row"
import { PermitApplicationGridHeaders } from "./permit-application-grid-headers"
import { PermitApplicationGridRow } from "./permit-application-grid-row"

// moved to shared/project/project-info-row.tsx

interface IProps {
  permitProject: IPermitProject
}

export const OverviewTabPanelContent = observer(({ permitProject }: IProps) => {
  const { fullAddress, pid, jurisdiction, number } = permitProject
  const { t } = useTranslation()
  const { permitProjectStore } = useMst()
  const [editableAddress, setEditableAddress] = useState(fullAddress || "")

  const handleAddressUpdate = async (newAddress: string) => {
    if (newAddress !== fullAddress) {
      await permitProjectStore.updatePermitProject(permitProject.id, { fullAddress: newAddress })
    }
  }

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

            <Flex justify="space-between" align="center" py={2} borderBottom="1px" borderColor="border.light" w="full">
              <Flex justify="space-between" align="center" w="full">
                <Text mr={2}>{t("permitProject.overview.address")}</Text>
                <EditableInputWithControls
                  initialHint={t("permitProject.overview.clickToEditAddress")}
                  value={editableAddress}
                  editableInputProps={{
                    minWidth: "400px",
                    fontWeight: "bold",
                    textAlign: "right",
                    "aria-label": t("permitProject.overview.address"),
                  }}
                  editablePreviewProps={{
                    fontWeight: "bold",
                  }}
                  aria-label={t("permitProject.overview.address")}
                  onChange={setEditableAddress}
                  onSubmit={handleAddressUpdate}
                  onCancel={() => setEditableAddress(fullAddress || "")}
                />
              </Flex>
              {editableAddress && <CopyLinkButton value={editableAddress} iconOnly />}
            </Flex>
            <ProjectInfoRow
              label={t("permitProject.overview.jurisdictionName")}
              value={jurisdiction?.disambiguatedName || t("permitProject.overview.notAvailable")}
              isCopyable
            />

            <ProjectInfoRow label={t("permitProject.overview.number")} value={number} isCopyable />
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
          <AddPermitsButton permitProject={permitProject} />
        </Flex>
        {permitProject.rollupStatus === EPermitProjectRollupStatus.empty ? (
          <CustomMessageBox status={EFlashMessageStatus.info} description={t("permitProject.index.empty")} mt={2} />
        ) : (
          <>
            <SearchGrid
              templateColumns="2fr 1.5fr 1.5fr 1.5fr 1.5fr 0.5fr"
              gridRowClassName="permit-application-grid-row"
            >
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
                to={`/projects/${permitProject.id}/permits`}
              >
                {t("permitProject.overview.allPermits")}
              </RouterLinkButton>
            </Flex>
          </>
        )}
      </Box>
    </Flex>
  )
})
