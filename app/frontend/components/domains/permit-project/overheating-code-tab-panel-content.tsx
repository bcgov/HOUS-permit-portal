import { Button, Container, Flex, Heading, Icon, IconButton, Menu, Portal, Text, VStack } from "@chakra-ui/react"
import { Archive, ClockClockwise, DotsThreeVertical, Plus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useSearch } from "../../../hooks/use-search"
import { IOverheatingCode } from "../../../models/overheating-code"
import { useMst } from "../../../setup/root"
import { Paginator } from "../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../shared/base/inputs/per-page-select"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { ToggleArchivedButton } from "../../shared/buttons/toggle-archived-button"
import { ConfirmationModal } from "../../shared/confirmation-modal"
import { SearchGrid } from "../../shared/grid/search-grid"
import { SearchGridItem } from "../../shared/grid/search-grid-item"
import { SearchGridRow } from "../../shared/grid/search-grid-row"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { OverheatingCodeGridHeaders } from "../overheating-code/grid-header"

export const OverheatingCodeTabPanelContent = observer(() => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { overheatingCodeStore } = useMst()
  const {
    currentPage,
    totalPages,
    totalCount,
    countPerPage,
    handleCountPerPageChange,
    handlePageChange,
    isSearching,
    showArchived,
    tableOverheatingCodes,
  } = overheatingCodeStore

  useSearch(overheatingCodeStore, [showArchived])

  return (
    <Flex direction="column" flex={1} bg="greys.white" pb={24} overflowY="auto" h={"full"}>
      <Container maxW="container.xl" py={8} h={"full"}>
        <VStack gap={3} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading as="h1">{t("overheatingCode.index.title", "Overheating Code Checks")}</Heading>
            <RouterLinkButton to="/overheating-codes/new" variant="primary" leftIcon={<Plus />}>
              {t("overheatingCode.startNew", "Start New Overheating Code Check")}
            </RouterLinkButton>
          </Flex>
          <Text fontSize="md" color="text.secondary" mb={4}>
            {t(
              "overheatingCode.index.intro",
              "Your overheating code check results are stored here. Use this service to verify compliance with overheating requirements before submitting a permit application."
            )}
          </Text>

          <SearchGrid templateColumns="1.5fr 1fr 1.5fr 2fr 0.5fr">
            <OverheatingCodeGridHeaders />
            {isSearching ? (
              <Flex py="50" gridColumn={"span 5"}>
                <SharedSpinner />
              </Flex>
            ) : (
              tableOverheatingCodes.map((oc: IOverheatingCode) => (
                <SearchGridRow key={oc.id} onClick={() => navigate(`/overheating-codes/${oc.id}/edit`)}>
                  <SearchGridItem>{oc.issuedTo || "—"}</SearchGridItem>
                  <SearchGridItem>{oc.projectNumber || "—"}</SearchGridItem>
                  <SearchGridItem>{oc.buildingModel || "—"}</SearchGridItem>
                  <SearchGridItem>{oc.fullAddress || "—"}</SearchGridItem>
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
                          onClick={(e) => e.stopPropagation()}
                          aria-label={t("ui.options")}
                        ></IconButton>
                      </Menu.Trigger>
                      <Portal>
                        <Menu.Positioner>
                          <Menu.Content>
                            <Menu.Item onSelect={() => navigate(`/overheating-codes/${oc.id}/edit`)} value="item-0">
                              {t("ui.view")}
                            </Menu.Item>
                            {!oc.isDiscarded && (
                              <ConfirmationModal
                                title={t("ui.confirmArchive")}
                                onConfirm={async (closeModal) => {
                                  if (await oc.archive()) {
                                    await overheatingCodeStore.search()
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
                            {oc.isDiscarded && (
                              <ConfirmationModal
                                title={t("ui.confirmRestore")}
                                onConfirm={async (closeModal) => {
                                  if (await oc.restore()) {
                                    await overheatingCodeStore.search()
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
              ))
            )}
          </SearchGrid>

          <Flex w={"full"} justifyContent={"space-between"} mt={6}>
            <PerPageSelect
              handleCountPerPageChange={handleCountPerPageChange}
              countPerPage={countPerPage}
              totalCount={totalCount}
            />
            <Paginator
              current={currentPage}
              total={totalCount}
              totalPages={totalPages}
              pageSize={countPerPage}
              handlePageChange={handlePageChange}
              showLessItems={true}
            />
          </Flex>

          <ToggleArchivedButton searchModel={overheatingCodeStore} mt={3} />
        </VStack>
      </Container>
    </Flex>
  )
})
