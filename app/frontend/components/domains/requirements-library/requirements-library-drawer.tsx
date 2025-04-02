import {
  Button,
  ButtonProps,
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react"
import { Plus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { Ref, useRef } from "react"
import { useTranslation } from "react-i18next"
import { IRequirementBlock } from "../../../models/requirement-block"
import { useMst } from "../../../setup/root"
import { RequirementBlocksTable } from "./requirement-blocks-table"

interface IProps {
  defaultButtonProps?: Partial<ButtonProps>
  renderTriggerButton?: (props: ButtonProps & { ref: Ref<HTMLElement> }) => JSX.Element
  onUse?: (requirementBlock: IRequirementBlock, closeDrawer?: () => void) => void
  disabledUseForBlockIds?: Set<string>
  disabledReason?: string
}

export const RequirementsLibraryDrawer = observer(function RequirementsLibraryDrawer({
  defaultButtonProps,
  renderTriggerButton,
  onUse,
  disabledUseForBlockIds,
  disabledReason,
}: IProps) {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef<HTMLButtonElement>()

  const tabStyles = {
    _selected: {
      bg: "greys.white",
      color: "theme.blue",
      fontWeight: "bold",
      borderBottom: 0,
      textDecoration: "none",
    },
    textDecoration: "underline",
    borderRadius: "sm",
    border: "1px solid",
    borderColor: "border.light",
    borderBottomRadius: 0,

    bg: "theme.blueLight",
    color: "text.link",
  }

  const { requirementBlockStore } = useMst()
  const { isEditingEarlyAccess } = requirementBlockStore

  return (
    <>
      {renderTriggerButton?.({ onClick: onOpen, ref: btnRef }) ?? (
        <Button
          leftIcon={<Plus size={12} />}
          variant={"primary"}
          onClick={onOpen}
          aria-label={"add requirement to template"}
          {...defaultButtonProps}
        >
          {t("requirementTemplate.edit.addRequirementButton")}
        </Button>
      )}
      <Drawer id="add-requirement-drawer" isOpen={isOpen} onClose={onClose} finalFocusRef={btnRef} placement={"right"}>
        <DrawerOverlay />
        <DrawerContent display={"flex"} flexDir={"column"} maxW={"80%"} h={"full"} p={8}>
          <DrawerCloseButton fontSize={"xs"} />
          {isEditingEarlyAccess ? (
            <Tabs variant="enclosed" colorScheme="teal" h="full">
              <TabList>
                <Tab {...tabStyles}>{t("requirementTemplate.edit.requirementsLibraryTab")}</Tab>
                <Tab {...tabStyles} ml={4}>
                  {t("requirementTemplate.edit.earlyAccessRequirementsLibraryTab")}
                </Tab>
              </TabList>
              <Text mt={8} mb={6}>
                {t("requirementTemplate.edit.earlyAccessTabDescription")}
              </Text>

              <TabPanels h="full" p={0}>
                <TabPanel h="full" p={0}>
                  {/* Regular Requirements Library */}
                  <RequirementBlocksTable
                    h={"calc(100% - 120px)"}
                    flex={1}
                    p={0}
                    renderActionButton={({ requirementBlock }) => {
                      const isDisabled = disabledUseForBlockIds.has(requirementBlock.id)
                      const shouldShowDisabledReason = isDisabled && disabledReason

                      const buttonProps = {
                        size: "sm",
                        variant: "primary",
                        onClick: () => onUse(requirementBlock, onClose),
                        isDisabled,
                        children: t("ui.use"),
                      }

                      return shouldShowDisabledReason ? (
                        <Tooltip label={disabledReason}>
                          <Button {...buttonProps} />
                        </Tooltip>
                      ) : (
                        <Button {...buttonProps} />
                      )
                    }}
                  />
                </TabPanel>
                <TabPanel h="full" p={0}>
                  {/* Early Access Requirements Library */}
                  <RequirementBlocksTable
                    h={"calc(100% - 120px)"}
                    flex={1}
                    p={0}
                    forEarlyAccess={true} // Pass forEarlyAccess prop
                    renderActionButton={({ requirementBlock }) => {
                      const isDisabled = disabledUseForBlockIds.has(requirementBlock.id)
                      const shouldShowDisabledReason = isDisabled && disabledReason

                      const buttonProps = {
                        size: "sm",
                        variant: "primary",
                        onClick: () => onUse(requirementBlock, onClose),
                        isDisabled,
                        children: t("ui.use"),
                      }

                      return shouldShowDisabledReason ? (
                        <Tooltip label={disabledReason}>
                          <Button {...buttonProps} />
                        </Tooltip>
                      ) : (
                        <Button {...buttonProps} />
                      )
                    }}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          ) : (
            // If not forEarlyAccess, render the original content
            <RequirementBlocksTable
              h={"calc(100% - 120px)"}
              flex={1}
              p={0}
              renderActionButton={({ requirementBlock }) => {
                const isDisabled = disabledUseForBlockIds.has(requirementBlock.id)
                const shouldShowDisabledReason = isDisabled && disabledReason

                const buttonProps = {
                  size: "sm",
                  variant: "primary",
                  onClick: () => onUse(requirementBlock, onClose),
                  isDisabled,
                  children: t("ui.use"),
                }

                return shouldShowDisabledReason ? (
                  <Tooltip label={disabledReason}>
                    <Button {...buttonProps} />
                  </Tooltip>
                ) : (
                  <Button {...buttonProps} />
                )
              }}
            />
          )}
        </DrawerContent>
      </Drawer>
    </>
  )
})
