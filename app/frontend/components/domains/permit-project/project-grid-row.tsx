import { Flex, IconButton, Menu, MenuButton, MenuItem, MenuList, Text } from "@chakra-ui/react"
import { DotsThreeVertical, Warning } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { datefnsTableDateFormat } from "../../../constants"
import { IPermitProject } from "../../../models/permit-project"
import { SearchGridItem } from "../../shared/grid/search-grid-item"
import { RouterLink } from "../../shared/navigation/router-link"
import { PhaseBox } from "../../shared/permit-projects/phase-box"

interface IProjectGridRowProps {
  project: IPermitProject
}

export const ProjectGridRow = observer(({ project }: IProjectGridRowProps) => {
  const { t } = useTranslation()

  return (
    <>
      {project.hasOutdatedDraftApplications && (
        <SearchGridItem colSpan={7} bg="semantic.warning" mb={-2} mx={4} p={1} mt={2}>
          <Flex alignItems="center" gap={1}>
            <Warning size={14} />
            <Text fontSize="xs">
              <Text as="span" fontWeight="bold">
                {t("permitProject.formUpdateWarningTitle")}
              </Text>
              : {t("permitProject.formUpdateWarningDescription")}
            </Text>
          </Flex>
        </SearchGridItem>
      )}
      <SearchGridItem>
        <RouterLink to={`/permit-projects/${project.id}`}>{project.title}</RouterLink>
      </SearchGridItem>
      <SearchGridItem>
        <Flex direction="column">
          <Text fontWeight="bold">{project.jurisdictionDisambiguatedName}</Text>
          <Text>{project.shortAddress}</Text>
        </Flex>
      </SearchGridItem>
      <SearchGridItem>todo</SearchGridItem>
      <SearchGridItem>{project.updatedAt && format(project.updatedAt, datefnsTableDateFormat)}</SearchGridItem>
      <SearchGridItem>
        {project.forcastedCompletionDate && format(project.forcastedCompletionDate, datefnsTableDateFormat)}
      </SearchGridItem>
      <SearchGridItem>
        <PhaseBox project={project} />
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
    </>
  )
})
