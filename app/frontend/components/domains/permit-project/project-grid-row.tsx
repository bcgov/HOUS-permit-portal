import { Avatar, Flex, HStack, IconButton, Menu, MenuButton, MenuItem, MenuList, Text } from "@chakra-ui/react"
import { DotsThreeVertical, PushPinSimple } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { datefnsTableDateTimeFormat } from "../../../constants"
import { IPermitProject } from "../../../models/permit-project"
import { useMst } from "../../../setup/root"
import { SearchGridItem } from "../../shared/grid/search-grid-item"
import { SearchGridRow } from "../../shared/grid/search-grid-row"
import { OutdatedFormWarning } from "../../shared/outdated-form-warning"
import { RollupStatusBox } from "../../shared/permit-projects/rollup-status-box"

interface IProjectGridRowProps {
  project: IPermitProject
}

export const ProjectGridRow = observer(({ project }: IProjectGridRowProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { permitProjectStore } = useMst()

  return (
    <SearchGridRow onClick={() => navigate(`/projects/${project.id}`)}>
      {project.hasOutdatedDraftApplications && <OutdatedFormWarning colSpan={7} mx={4} mt={2} />}
      <SearchGridItem>{project.title}</SearchGridItem>
      <SearchGridItem>
        <Flex direction="column">
          <Text fontWeight="bold">{project.jurisdictionDisambiguatedName}</Text>
          <Text>{project.shortAddress}</Text>
        </Flex>
      </SearchGridItem>
      <SearchGridItem>
        <Avatar name={project.ownerName} size="sm" />
      </SearchGridItem>
      <SearchGridItem>{project.updatedAt && format(project.updatedAt, datefnsTableDateTimeFormat)}</SearchGridItem>
      <SearchGridItem>
        <RollupStatusBox project={project} />
      </SearchGridItem>
      <SearchGridItem justifyContent="flex-end">
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label={t("ui.options")}
            icon={<DotsThreeVertical size={24} />}
            variant="ghost"
            onClick={(e) => e.stopPropagation()}
          />
          <MenuList>
            <MenuItem
              onClick={(e) => {
                e.stopPropagation()
                project.togglePin()
              }}
            >
              <HStack spacing={2} fontSize={"sm"}>
                <PushPinSimple size={16} />
                <Text>
                  {project.isPinned
                    ? t("permitProject.unpinProject", "Unpin project")
                    : t("permitProject.pinProject", "Pin project")}
                </Text>
              </HStack>
            </MenuItem>
          </MenuList>
        </Menu>
      </SearchGridItem>
    </SearchGridRow>
  )
})
