import { Box, Flex, Heading, IconButton, Menu, MenuButton, MenuItem, MenuList, Text, VStack } from "@chakra-ui/react"
import { DotsThreeVertical } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React from "react"
import { useTranslation } from "react-i18next"
import { datefnsTableDateFormat } from "../../../constants"
import { IPermitProject } from "../../../models/permit-project"
import { useMst } from "../../../setup/root"
import { EPermitProjectSortFields } from "../../../types/enums"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { SearchGrid } from "../../shared/grid/search-grid"
import { SearchGridItem } from "../../shared/grid/search-grid-item"
import { RouterLink } from "../../shared/navigation/router-link"
import { GridHeaders } from "./grid-header"

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
        <Box bg="greys.grey04" p={10} borderRadius="md" borderWidth="1px" borderColor="border.light">
          <Text textAlign="center" color="greys.grey70">
            {t("permitProject.index.noPinnedProjects", "You have no pinned projects")}
          </Text>
        </Box>
      ) : (
        <SearchGrid templateColumns="2fr 1.5fr 1.5fr 1.5fr 1.5fr 1.5fr 0.5fr" gridRowClassName="project-grid-row">
          <GridHeaders columns={Object.values(EPermitProjectSortFields)} includeActionColumn />
          {pinnedProjects.map((project: IPermitProject) => (
            <Box key={project.id} display="contents" role="row" className="project-grid-row">
              <SearchGridItem>
                <RouterLink to={`/permit-projects/${project.id}`}>{project.title}</RouterLink>
              </SearchGridItem>
              <SearchGridItem>{project.fullAddress}</SearchGridItem>
              <SearchGridItem>submitter</SearchGridItem>
              <SearchGridItem>{project.updatedAt && format(project.updatedAt, datefnsTableDateFormat)}</SearchGridItem>
              <SearchGridItem>
                {project.forcastedCompletionDate && format(project.forcastedCompletionDate, datefnsTableDateFormat)}
              </SearchGridItem>
              <SearchGridItem>
                {/* @ts-ignore */}
                <Text fontWeight="bold">{t(`permitProject.phase.${project.phase}`)}</Text>
              </SearchGridItem>
              <SearchGridItem>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    aria-label={t("ui.options")}
                    icon={<DotsThreeVertical size={24} />}
                    variant="ghost"
                  />
                  <MenuList>
                    <MenuItem onClick={() => project.togglePin()}>
                      {project.isPinned
                        ? t("permitProject.unpinProject", "Unpin project")
                        : t("permitProject.pinProject", "Pin project")}
                    </MenuItem>
                  </MenuList>
                </Menu>
              </SearchGridItem>
            </Box>
          ))}
        </SearchGrid>
      )}
    </VStack>
  )
})
