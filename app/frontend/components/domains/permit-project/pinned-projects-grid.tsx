import { Flex, Heading, VStack } from "@chakra-ui/react"
import { PushPinSimple } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitProject } from "../../../models/permit-project"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus, EPermitProjectSortFields } from "../../../types/enums"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { SearchGrid } from "../../shared/grid/search-grid"
import { GridHeaders, PROJECTS_GRID_TEMPLATE_COLUMNS } from "./grid-header"
import { ProjectGridRow } from "./project-grid-row"

export const PinnedProjectsGrid = observer(() => {
  const { t } = useTranslation()
  const { permitProjectStore } = useMst()
  const { isFetchingPinnedProjects, pinnedPermitProjects } = permitProjectStore

  return (
    <VStack align="stretch" spacing={4}>
      <Heading as="h2" size="lg">
        {t("permitProject.index.pinnedPermitProjects", "Pinned projects")}
      </Heading>
      {isFetchingPinnedProjects ? (
        <Flex justify="center" align="center" minH="200px">
          <SharedSpinner />
        </Flex>
      ) : pinnedPermitProjects.length === 0 ? (
        <CustomMessageBox
          w="full"
          status={EFlashMessageStatus.info}
          icon={<PushPinSimple size={20} weight="bold" aria-label={t("permitProject.pinProject", "Pin project")} />}
          title={t("permitProject.index.noPinnedProjects", "You haven't pinned any projects yet")}
          description={t(
            "permitProject.index.noPinnedProjectsDescription",
            "Pinning a project keeps it at the top of your list so it's easier to find. Open the more actions menu for a project and select Pin."
          )}
          headingProps={{ mb: 1 }}
        />
      ) : (
        <SearchGrid templateColumns={PROJECTS_GRID_TEMPLATE_COLUMNS} gridRowClassName="project-grid-row">
          <GridHeaders columns={Object.values(EPermitProjectSortFields)} includeActionColumn />
          {pinnedPermitProjects.map((project: IPermitProject) => (
            <ProjectGridRow key={project.id} project={project} />
          ))}
        </SearchGrid>
      )}
    </VStack>
  )
})
