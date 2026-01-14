import {
  Avatar,
  Button,
  Grid,
  GridItem,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react"
import { Archive, ClockClockwise, DotsThreeVertical } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { datefnsTableDateTimeFormat } from "../../../constants"
import { ISearch } from "../../../lib/create-search-model"
import { IPermitApplication } from "../../../models/permit-application"
import { useMst } from "../../../setup/root"
import { colors } from "../../../styles/theme/foundations/colors"
import { ConfirmationModal } from "../../shared/confirmation-modal"
import { OutdatedFormWarning } from "../../shared/outdated-form-warning"
import { PermitApplicationStatusTag } from "../../shared/permit-applications/permit-application-status-tag"

interface IPermitApplicationGridRowProps {
  permitApplication: IPermitApplication
  searchModel?: ISearch
}

export const PermitApplicationGridRow = observer(
  ({ permitApplication, searchModel }: IPermitApplicationGridRowProps) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { id, updatedAt, designatedSubmitter, usingCurrentTemplateVersion } = permitApplication
    const { sandboxStore, userStore } = useMst()
    const { currentSandbox } = sandboxStore
    const { currentUser } = userStore
    const isDisabledRow = currentSandbox?.id !== permitApplication.sandbox?.id && !currentUser?.isSuperAdmin
    const shouldMarkRow = currentSandbox?.id !== permitApplication.sandbox?.id
    const isSubmitter = currentUser?.id === permitApplication.submitter?.id

    return (
      <Tooltip
        isDisabled={!isDisabledRow}
        label={t("sandbox.disabledRow", "Disabled due to sandbox mismatch")}
        hasArrow
        placement="top"
        openDelay={200}
      >
        <Grid
          gridColumn="1 / -1"
          templateColumns="subgrid"
          display="grid"
          aria-disabled={isDisabledRow}
          // bg={isDisabled ? "background.grey03" : undefined}
          bgImage={
            shouldMarkRow
              ? `repeating-linear-gradient(45deg,${colors.background.sandboxStripe} 5px,${colors.background.sandboxStripe} 10px,rgba(0, 0, 0, 0) 10px,rgba(0, 0, 0, 0) 20px)`
              : undefined
          }
          bgSize={isDisabledRow ? "100% 100%" : undefined}
          onClick={() => {
            if (isDisabledRow) return
            navigate(`/permit-applications/${id}/edit`)
          }}
          _hover={
            isDisabledRow
              ? { cursor: "not-allowed" }
              : {
                  bg: "greys.grey03",
                  cursor: "pointer",
                }
          }
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
                isDisabled={isDisabledRow}
                onClick={(e) => e.stopPropagation()}
                aria-label={t("ui.options")}
              />
              <MenuList>
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    if (isDisabledRow) return
                    navigate(`/permit-applications/${id}/edit`)
                  }}
                >
                  {t("ui.view")}
                </MenuItem>
                {!permitApplication.isDiscarded && permitApplication.isDraft && isSubmitter && (
                  <ConfirmationModal
                    title={t("ui.confirmArchive")}
                    onConfirm={async (closeModal) => {
                      if (await permitApplication.archive()) {
                        await searchModel?.search()
                      }
                      closeModal()
                    }}
                    renderTriggerButton={({ onClick }) => (
                      <MenuItem
                        icon={<Archive size={16} />}
                        color="semantic.error"
                        onClick={(e) => {
                          e.stopPropagation()
                          onClick(e)
                        }}
                      >
                        {t("ui.archive")}
                      </MenuItem>
                    )}
                    renderConfirmationButton={(props) => (
                      <Button {...props} colorScheme="red">
                        {t("ui.archive")}
                      </Button>
                    )}
                  />
                )}
                {permitApplication.isDiscarded && isSubmitter && (
                  <ConfirmationModal
                    title={t("ui.confirmRestore")}
                    onConfirm={async (closeModal) => {
                      if (await permitApplication.restore()) {
                        await searchModel?.search()
                      }
                      closeModal()
                    }}
                    renderTriggerButton={({ onClick }) => (
                      <MenuItem
                        icon={<ClockClockwise size={16} />}
                        color="semantic.success"
                        onClick={(e) => {
                          e.stopPropagation()
                          onClick(e)
                        }}
                      >
                        {t("ui.restore")}
                      </MenuItem>
                    )}
                    renderConfirmationButton={(props) => (
                      <Button {...props} colorScheme="green">
                        {t("ui.restore")}
                      </Button>
                    )}
                  />
                )}
              </MenuList>
            </Menu>
          </GridItem>
        </Grid>
      </Tooltip>
    )
  }
)
