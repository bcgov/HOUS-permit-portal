import { Grid, GridItem, IconButton, Menu, MenuButton, MenuItem, MenuList, Text } from "@chakra-ui/react"
import { DotsThreeVertical } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { datefnsTableDateTimeFormat } from "../../../constants"
import { IPreCheck } from "../../../models/pre-check"

interface IPreCheckGridRowProps {
  preCheck: IPreCheck
}

export const PreCheckGridRow = observer(({ preCheck }: IPreCheckGridRowProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <>
      <Grid
        gridColumn="1 / -1"
        templateColumns="subgrid"
        display="grid"
        onClick={() => navigate(`/pre-checks/${preCheck.id}/edit`)}
        _hover={{
          bg: "greys.grey03",
          cursor: "pointer",
        }}
        borderBottom="1px"
        borderColor="border.light"
        _last={{ borderBottom: "none" }}
      >
        <GridItem display="flex" alignItems="center" px={4} py={2}>
          <Text>{preCheck.fullAddress || "-"}</Text>
        </GridItem>
        <GridItem display="flex" alignItems="center" px={4} py={2}>
          <Text>{preCheck.title || "-"}</Text>
        </GridItem>
        <GridItem display="flex" alignItems="center" px={4} py={2}>
          {preCheck.updatedAt && format(preCheck.updatedAt, datefnsTableDateTimeFormat)}
        </GridItem>
        <GridItem display="flex" alignItems="center" px={4} py={2}>
          <Text>{preCheck.status || "-"}</Text>
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
                  navigate(`/pre-checks/${preCheck.id}/edit`)
                }}
              >
                {t("ui.view", "View")}
              </MenuItem>
            </MenuList>
          </Menu>
        </GridItem>
      </Grid>
    </>
  )
})
