import { Tooltip } from "@/components/ui/tooltip"
import { Button, ButtonProps, Drawer, Portal, useDisclosure } from "@chakra-ui/react"
import { Plus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { Ref, useRef } from "react"
import { useTranslation } from "react-i18next"
import { IRequirementBlock } from "../../../models/requirement-block"
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
  const { open, onOpen, onClose } = useDisclosure()
  const btnRef = useRef<HTMLButtonElement>()

  return (
    <>
      {renderTriggerButton?.({ onClick: onOpen, ref: btnRef }) ?? (
        <Button variant={"primary"} onClick={onOpen} aria-label={"add requirement to template"} {...defaultButtonProps}>
          <Plus size={12} />
          {t("requirementTemplate.edit.addRequirementButton")}
        </Button>
      )}
      <Drawer.Root
        id="add-requirement-drawer"
        open={open}
        finalFocusEl={() => btnRef.current}
        placement={"right"}
        onOpenChange={(e) => {
          if (!e.open) {
            onClose()
          }
        }}
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content display={"flex"} flexDir={"column"} maxW={"80%"} h={"full"} p={8}>
              <Drawer.CloseTrigger fontSize={"xs"} />
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
                    <Tooltip content={disabledReason}>
                      <Button {...buttonProps} />
                    </Tooltip>
                  ) : (
                    <Button {...buttonProps} />
                  )
                }}
              />
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </>
  )
})
