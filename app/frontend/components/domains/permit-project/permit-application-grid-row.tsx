import {
  Avatar,
  Grid,
  GridItem,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  VStack,
} from "@chakra-ui/react"
import { DotsThreeVertical } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { datefnsTableDateTimeFormat } from "../../../constants"
import { IPermitApplication } from "../../../models/permit-application"
import { OutdatedFormWarning } from "../../shared/outdated-form-warning"
import { PermitApplicationStatusTag } from "../../shared/permit-applications/permit-application-status-tag"

interface IPermitApplicationGridRowProps {
  permitApplication: IPermitApplication
}

export const PermitApplicationGridRow = observer(({ permitApplication }: IPermitApplicationGridRowProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id, updatedAt, designatedSubmitter, usingCurrentTemplateVersion } = permitApplication

  return (
    <Grid
      gridColumn="1 / -1"
      templateColumns="subgrid"
      display="grid"
      onClick={() => navigate(`/permit-applications/${id}/edit`)}
      _hover={{
        bg: "greys.grey03",
        cursor: "pointer",
      }}
      borderBottom="1px"
      borderColor="border.light"
      _last={{ borderBottom: "none" }}
    >
      {!usingCurrentTemplateVersion && <OutdatedFormWarning colSpan={6} mx={4} mt={2} />}
      <GridItem display="flex" alignItems="center" px={4} py={2}>
        <VStack align="start" spacing={0}>
          <Text variant="secondary">{permitApplication.templateNickname}</Text>
        </VStack>
      </GridItem>
      <GridItem display="flex" alignItems="center" px={4} py={2}>
        <Avatar name={designatedSubmitter?.collaborator?.user?.name} size="sm" />
      </GridItem>
      <GridItem display="flex" alignItems="center" px={4} py={2}>
        <Text>{permitApplication.number}</Text>
      </GridItem>
      <GridItem display="flex" alignItems="center" px={4} py={2}>
        <Text>{format(updatedAt, datefnsTableDateTimeFormat)}</Text>
      </GridItem>
      <GridItem display="flex" alignItems="center" px={4} py={2}>
        <PermitApplicationStatusTag permitApplication={permitApplication} />
      </GridItem>
      <GridItem display="flex" alignItems="center" justifyContent="flex-end" px={4} py={2}>
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<Icon as={DotsThreeVertical} />}
            variant="ghost"
            onClick={(e) => e.stopPropagation()}
            aria-label={t("ui.options")}
          />
          <MenuList>
            <MenuItem
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/permit-applications/${id}/edit`)
              }}
            >
              {t("ui.view")}
            </MenuItem>
          </MenuList>
        </Menu>
      </GridItem>
    </Grid>
  )
})
