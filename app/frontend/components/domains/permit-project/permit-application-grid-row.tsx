import { Tooltip } from "@/components/ui/tooltip"
import { Avatar, Button, Icon, IconButton, Menu, Portal, Text, VStack } from "@chakra-ui/react"
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
import { SearchGridItem } from "../../shared/grid/search-grid-item"
import { SearchGridRow } from "../../shared/grid/search-grid-row"
import { OutdatedFormWarning } from "../../shared/outdated-form-warning"
import { PermitApplicationStatusTag } from "../../shared/permit-applications/permit-application-status-tag"
import { ApplicationReviewAssigneesCell } from "../jurisdictions/submission-inbox/application-review-assignees-cell"

interface IPermitApplicationGridRowProps {
  permitApplication: IPermitApplication
  searchModel?: ISearch
  fromInbox?: boolean
}

export const PermitApplicationGridRow = observer(
  ({ permitApplication, searchModel, fromInbox = false }: IPermitApplicationGridRowProps) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { id, updatedAt, designatedSubmitter, usingCurrentTemplateVersion } = permitApplication
    const { sandboxStore, userStore } = useMst()
    const { currentSandbox } = sandboxStore
    const { currentUser } = userStore
    const isDisabledRow = currentSandbox?.id !== permitApplication.sandbox?.id && !currentUser?.isSuperAdmin
    const shouldMarkRow = currentSandbox?.id !== permitApplication.sandbox?.id
    const isSubmitter = currentUser?.id === permitApplication.submitter?.id
    const permitApplicationPath = fromInbox ? `/permit-applications/${id}` : `/permit-applications/${id}/edit`

    return (
      <Tooltip
        disabled={!isDisabledRow}
        content={t("sandbox.disabledRow", "Disabled due to sandbox mismatch")}
        showArrow
        openDelay={200}
        positioning={{
          placement: "top",
        }}
      >
        <SearchGridRow
          aria-disabled={isDisabledRow}
          bgImage={
            shouldMarkRow
              ? `repeating-linear-gradient(45deg,${colors.background.sandboxStripe} 5px,${colors.background.sandboxStripe} 10px,rgba(0, 0, 0, 0) 10px,rgba(0, 0, 0, 0) 20px)`
              : undefined
          }
          bgSize={isDisabledRow ? "100% 100%" : undefined}
          onClick={() => {
            if (isDisabledRow) return
            navigate(permitApplicationPath)
          }}
          _hover={
            isDisabledRow
              ? { cursor: "not-allowed" }
              : {
                  bg: "greys.grey03",
                  cursor: "pointer",
                }
          }
        >
          {!usingCurrentTemplateVersion && <OutdatedFormWarning colSpan={6} mx={4} mt={2} />}
          <SearchGridItem>
            <VStack align="start" gap={0}>
              <Text color="text.secondary">{permitApplication.templateNickname}</Text>
            </VStack>
          </SearchGridItem>
          <SearchGridItem
            onClick={(e: React.MouseEvent) => {
              if (fromInbox) {
                e.preventDefault()
                e.stopPropagation()
              }
            }}
          >
            {fromInbox ? (
              <ApplicationReviewAssigneesCell application={permitApplication} />
            ) : (
              <Avatar.Root size="sm">
                <Avatar.Fallback name={designatedSubmitter?.collaborator?.user?.name} />
              </Avatar.Root>
            )}
          </SearchGridItem>
          <SearchGridItem>{permitApplication.number}</SearchGridItem>
          <SearchGridItem>{format(updatedAt, datefnsTableDateTimeFormat)}</SearchGridItem>
          <SearchGridItem>
            <PermitApplicationStatusTag status={permitApplication.status} />
          </SearchGridItem>
          <SearchGridItem justifyContent="flex-end">
            <Menu.Root>
              <Menu.Trigger asChild>
                <IconButton
                  icon={
                    <Icon asChild>
                      <DotsThreeVertical />
                    </Icon>
                  }
                  variant="ghost"
                  disabled={isDisabledRow}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={t("ui.options")}
                ></IconButton>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    <Menu.Item
                      onSelect={(e) => {
                        e.stopPropagation()
                        if (isDisabledRow) return
                        navigate(permitApplicationPath)
                      }}
                      value="item-0"
                    >
                      {t("ui.view")}
                    </Menu.Item>
                    {!permitApplication.isDiscarded && permitApplication.isDraft && isSubmitter && (
                      <ConfirmationModal
                        title={t("ui.confirmArchive")}
                        body={t("ui.archiveRetentionNotice" as any)}
                        onConfirm={async (closeModal) => {
                          if (await permitApplication.archive()) {
                            await searchModel?.search()
                          }
                          closeModal()
                        }}
                        renderTriggerButton={({ onClick }) => (
                          <Menu.Item
                            icon={<Archive size={16} />}
                            color="semantic.error"
                            onSelect={(e) => {
                              e.stopPropagation()
                              onClick(e)
                            }}
                            value="item-1"
                          >
                            {t("ui.archive")}
                          </Menu.Item>
                        )}
                        renderConfirmationButton={(props) => (
                          <Button {...props} colorPalette="red">
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
                          <Menu.Item
                            icon={<ClockClockwise size={16} />}
                            color="semantic.success"
                            onSelect={(e) => {
                              e.stopPropagation()
                              onClick(e)
                            }}
                            value="item-2"
                          >
                            {t("ui.restore")}
                          </Menu.Item>
                        )}
                        renderConfirmationButton={(props) => (
                          <Button {...props} colorPalette="green">
                            {t("ui.restore")}
                          </Button>
                        )}
                      />
                    )}
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </SearchGridItem>
        </SearchGridRow>
      </Tooltip>
    )
  }
)
