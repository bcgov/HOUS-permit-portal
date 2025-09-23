import { Avatar, Flex, Grid, GridItem, IconButton, Menu, MenuButton, MenuItem, MenuList, Text } from "@chakra-ui/react"
import { DotsThreeVertical } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { datefnsTableDateTimeFormat } from "../../../constants"
import { IPermitProject } from "../../../models/permit-project"
import { useMst } from "../../../setup/root"
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
    <>
      <Grid
        gridColumn="1 / -1"
        templateColumns="subgrid"
        display="grid"
        onClick={() => navigate(`/projects/${project.id}`)}
        _hover={{
          bg: "greys.grey03",
          cursor: "pointer",
        }}
        borderBottom="1px"
        borderColor="border.light"
        _last={{ borderBottom: "none" }}
      >
        {project.hasOutdatedDraftApplications && <OutdatedFormWarning colSpan={7} mx={4} mt={2} />}
        <GridItem display="flex" alignItems="center" px={4} py={2}>
          <Text>{project.title}</Text>
        </GridItem>
        <GridItem display="flex" alignItems="center" px={4} py={2}>
          <Flex direction="column">
            <Text fontWeight="bold">{project.jurisdictionDisambiguatedName}</Text>
            <Text>{project.shortAddress}</Text>
          </Flex>
        </GridItem>
        <GridItem display="flex" alignItems="center" px={4} py={2}>
          <Avatar name={project.ownerName} size="sm" />
        </GridItem>
        <GridItem display="flex" alignItems="center" px={4} py={2}>
          {project.updatedAt && format(project.updatedAt, datefnsTableDateTimeFormat)}
        </GridItem>
        <GridItem display="flex" alignItems="center" px={4} py={2}>
          <RollupStatusBox project={project} />
        </GridItem>
        <GridItem display="flex" alignItems="center" justifyContent="flex-end" px={4} py={2}>
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
                {project.isPinned
                  ? t("permitProject.unpinProject", "Unpin project")
                  : t("permitProject.pinProject", "Pin project")}
              </MenuItem>
            </MenuList>
          </Menu>
        </GridItem>
      </Grid>
    </>
  )
})
