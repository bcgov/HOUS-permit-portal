import { Box, Button, Popover, Portal, Text, VStack, useDisclosure } from "@chakra-ui/react"
import { CaretDown, MagnifyingGlass } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { ControlProps, components } from "react-select"
import { IJurisdiction } from "../../../models/jurisdiction"
import { useMst } from "../../../setup/root"
import { IOption } from "../../../types/types"
import { ConditionalTooltip } from "../../shared/conditional-tooltip"
import { JurisdictionSelect } from "../../shared/select/selectors/jurisdiction-select"

export const RegionalRMJurisdictionSelect = observer(function RegionalRMJurisdictionSelect() {
  const { userStore, uiStore, sandboxStore } = useMst()
  const { currentUser } = userStore
  const { isSandboxActive } = sandboxStore
  const { onOpen, onClose, open } = useDisclosure()
  const { t } = useTranslation()

  return (
    <Popover.Root
      open={open}
      onOpenChange={(e) => {
        if (e.open) {
          onOpen()
        } else {
          onClose()
        }
      }}
      positioning={{
        placement: "bottom-end",
      }}
    >
      <Popover.Trigger asChild>
        <ConditionalTooltip
          showTooltip={isSandboxActive}
          message={t("sandbox.disableJurisdictionSwitchTooltip")}
          tooltipProps={{ placement: "bottom-end", openDelay: 200 }}
        >
          <Button
            variant="outline"
            fontWeight="bold"
            size="xs"
            bg={open ? "semantic.warning" : "semantic.warningLight"}
            borderColor="semantic.warning"
            _hover={{ bg: "semantic.warning" }}
            disabled={isSandboxActive}
          >
            {currentUser.jurisdiction.qualifiedName}
            <CaretDown />
          </Button>
        </ConditionalTooltip>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content shadow="none">
            <JurisdictionSelect
              onChange={(val) => {
                uiStore.setCurrentlySelectedJurisdictionId(val.id)
                onClose()
              }}
              selectedOption={{
                label: currentUser.jurisdiction.qualifiedName,
                value: currentUser.jurisdiction,
              }}
              stylesToMerge={{
                control: {
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                  borderBottomWidth: 0,
                  borderColor: "var(--chakra-colors-border-base)",
                  boxShadow: "none",
                  //@ts-ignore
                  "&:hover": {
                    border: "1px solid var(--chakra-colors-border-base)",
                  },
                  gap: "var(--chakra-space-1)",
                },
                input: { margin: 0 },
                menu: {
                  margin: 0,
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                  boxShadow: "none",
                  borderWidth: 1,
                  borderTopWidth: 0,
                  borderColor: "var(--chakra-colors-border-base)",
                },
                valueContainer: {
                  paddingInlineStart: 0,
                  paddingInlineEnd: 0,
                  padding: 0,
                },
              }}
              components={{ Control: Control as any }}
              filters={{ userId: currentUser.id }}
              isClearable={false}
              placeholder={null}
              controlShouldRenderValue={false}
              closeMenuOnSelect={false}
              menuIsOpen={true}
            />
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  )
})

const Control = ({ children, ...props }: ControlProps<IOption<IJurisdiction>>) => {
  const { t } = useTranslation()
  return (
    <>
      <components.Control {...props}>
        <MagnifyingGlass color="greys.grey01" size={"14px"} />
        {children}
      </components.Control>
      <Box w="full" borderLeftWidth={1} borderRightWidth={1} borderColor="border.base">
        <VStack borderTopWidth={1} borderBottomWidth={1} borderColor="border.light" py={1} w="full" bg="greys.grey03">
          <Text color="text.secondary" textTransform="uppercase" fontWeight="bold" fontSize="xs">
            {t("jurisdiction.view")}
          </Text>
        </VStack>
      </Box>
    </>
  )
}
