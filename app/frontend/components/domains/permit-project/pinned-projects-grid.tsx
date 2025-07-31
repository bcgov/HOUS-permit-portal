import { Flex, Heading, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitProject } from "../../../models/permit-project"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus, EPermitProjectSortFields } from "../../../types/enums"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { SearchGrid } from "../../shared/grid/search-grid"
import { GridHeaders } from "./grid-header"
import { ProjectGridRow } from "./project-grid-row"

export const PinnedProjectsGrid = observer(() => {
  const { t } = useTranslation()
  const { permitProjectStore } = useMst()
  const { isFetchingPinnedProjects, pinnedProjects } = permitProjectStore

  return (
    <VStack align="stretch" spacing={4}>
      <Heading as="h2" size="lg">
        {t("permitProject.index.pinnedProjects", "Pinned projects")}
      </Heading>
      {isFetchingPinnedProjects ? (
        <Flex justify="center" align="center" minH="200px">
          <SharedSpinner />
        </Flex>
      ) : R.isEmpty(pinnedProjects) ? (
        <CustomMessageBox
          status={EFlashMessageStatus.info}
          description={t("permitProject.index.noPinnedProjects", "You have no pinned projects")}
        />
      ) : (
        <SearchGrid templateColumns="2fr 1.5fr 1.5fr 2fr 1.5fr 2fr 0.5fr" gridRowClassName="project-grid-row">
          <GridHeaders columns={Object.values(EPermitProjectSortFields)} includeActionColumn />
          {pinnedProjects.map((project: IPermitProject) => (
            <ProjectGridRow key={project.id} project={project} />
          ))}
        </SearchGrid>
      )}
    </VStack>
  )
})
