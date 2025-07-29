import {
  Avatar,
  Box,
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
import { IPermitApplication } from "../../../models/permit-application"
import { PermitApplicationStatusTag } from "../../shared/permit-applications/permit-application-status-tag"

interface IPermitApplicationGridRowProps {
  permitApplication: IPermitApplication
}

export const PermitApplicationGridRow = observer(({ permitApplication }: IPermitApplicationGridRowProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id, updatedAt, submitter } = permitApplication
  const submitterName = submitter?.name

  return (
    <Box
      display="contents"
      onClick={() => navigate(`/permit-applications/${id}`)}
      _hover={{
        bg: "greys.grey04",
        cursor: "pointer",
      }}
      borderBottom="1px"
      borderColor="border.light"
      _last={{ borderBottom: "none" }}
    >
      <GridItem display="flex" alignItems="center" px={4} py={2}>
        <VStack align="start" spacing={0}>
          <Text variant="secondary">{permitApplication.templateNickname}</Text>
        </VStack>
      </GridItem>
      <GridItem display="flex" alignItems="center" px={4} py={2}>
        <Avatar name={submitterName} size="sm" />
      </GridItem>
      <GridItem display="flex" alignItems="center" px={4} py={2}>
        <Text>{format(updatedAt, "MMM-dd-yyyy HH:mm")}</Text>
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
            <MenuItem>{t("ui.view")}</MenuItem>
            <MenuItem>{t("ui.delete")}</MenuItem>
          </MenuList>
        </Menu>
      </GridItem>
    </Box>
  )
})
