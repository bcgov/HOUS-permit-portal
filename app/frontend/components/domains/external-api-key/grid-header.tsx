import { Box, Flex, GridItem, Text, Tooltip } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { EJurisdictionExternalApiState } from "../../../types/enums"
import { FormSwitch } from "../../shared/form-switch"
import { GridHeader } from "../../shared/grid/grid-header"
import { RemoveConfirmationModal } from "../../shared/modals/remove-confirmation-modal"

export const GridHeaders = observer(function GridHeaders() {
  const { userStore } = useMst()
  const { currentUser } = userStore

  const { t } = useTranslation()
  const columnHeaders: string[] = [
    t("externalApiKey.fieldLabels.name"),
    t("externalApiKey.fieldLabels.connectingApplication"),
    t("externalApiKey.fieldLabels.status"),
    t("externalApiKey.fieldLabels.sandbox"),
    t("externalApiKey.fieldLabels.createdAt"),
    t("externalApiKey.fieldLabels.expiredAt"),
    t("externalApiKey.fieldLabels.revokedAt"),
  ]

  return (
    <Box display={"contents"} role={"rowgroup"}>
      <Box display={"contents"} role={"row"}>
        <GridItem
          as={Flex}
          gridColumn={"span 8"}
          p={6}
          bg={"greys.grey10"}
          justifyContent={"space-between"}
          align="center"
        >
          <Text role={"heading"}>{t("externalApiKey.index.table.heading")}</Text>

          {currentUser.isManager && currentUser.jurisdiction.externalApiState === EJurisdictionExternalApiState.gOff ? (
            <Tooltip label={t("externalApiKey.index.disabledTooltipLabel")}>
              <Box>
                <ExternalApiEnabledSwitchWithConfirmation />
              </Box>
            </Tooltip>
          ) : (
            <ExternalApiEnabledSwitchWithConfirmation />
          )}
        </GridItem>
      </Box>
      <Box display={"contents"} role={"row"}>
        {columnHeaders.map((heading) => (
          <GridHeader key={heading} role={"columnheader"}>
            <Flex
              w={"full"}
              h={"full"}
              alignItems={"center"}
              borderY={"none"}
              borderX={"none"}
              borderRight={"1px solid"}
              borderColor={"border.light"}
              px={4}
            >
              {heading}
            </Flex>
          </GridHeader>
        ))}
        <GridHeader role={"columnheader"} />
      </Box>
    </Box>
  )
})

const ExternalApiEnabledSwitchWithConfirmation = observer(() => {
  const { jurisdictionStore, userStore } = useMst()
  const { currentJurisdiction } = jurisdictionStore
  const { currentUser } = userStore
  const { t } = useTranslation()

  const isDisabled =
    currentUser.isManager && currentJurisdiction.externalApiState === EJurisdictionExternalApiState.gOff

  const shouldUseDisableConfirmationModal =
    !isDisabled && currentJurisdiction.externalApiEnabled && currentJurisdiction.externalApiKeysMap.size > 0

  return shouldUseDisableConfirmationModal ? (
    <RemoveConfirmationModal
      renderTriggerButton={({ onClick }) => (
        <ExternalApiEnabledSwitch
          externalApiEnabled={currentJurisdiction.externalApiEnabled}
          isDisabled={isDisabled}
          // @ts-ignore
          onChange={onClick}
        />
      )}
      triggerText={t("ui.disable")}
      title={t("externalApiKey.index.disableConfirmationModal.title")}
      body={t("externalApiKey.index.disableConfirmationModal.body")}
      onRemove={currentJurisdiction.toggleExternalApiEnabled}
    />
  ) : (
    <ExternalApiEnabledSwitch
      externalApiEnabled={currentJurisdiction.externalApiEnabled}
      isDisabled={isDisabled}
      onChange={currentJurisdiction.toggleExternalApiEnabled}
    />
  )
})

const ExternalApiEnabledSwitch = observer(
  ({
    externalApiEnabled,
    isDisabled = false,
    onChange,
  }: {
    isDisabled?: boolean
    externalApiEnabled: boolean
    onChange?: () => void
  }) => {
    const { t } = useTranslation()

    return (
      <FormSwitch
        switchIdForAccessibility={"enableJurisdictionExternalApiKey"}
        isChecked={externalApiEnabled}
        onChange={onChange}
        isDisabled={isDisabled}
        checkedText={t("externalApiKey.index.enabled")}
        uncheckedText={t("externalApiKey.index.disabled")}
      />
    )
  }
)
