import {
  Button,
  ButtonProps,
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  useDisclosure,
} from "@chakra-ui/react"
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
  disableUseForBlockIds?: Set<string>
}

export const RequirementsLibraryDrawer = observer(function RequirementsLibraryDrawer({
  defaultButtonProps,
  renderTriggerButton,
  onUse,
  disableUseForBlockIds,
}: IProps) {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef<HTMLButtonElement>()

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
      <Drawer isOpen={isOpen} onClose={onClose} finalFocusRef={btnRef} placement={"right"}>
        <DrawerOverlay />
        <DrawerContent display={"flex"} flexDir={"column"} maxW={"80%"} h={"full"}>
          <DrawerCloseButton fontSize={"xs"} />
          <RequirementBlocksTable
            h={"calc(100% - 120px)"}
            flex={1}
            p={8}
            renderActionButton={({ requirementBlock }) => (
              <Button
                size={"sm"}
                variant={"primary"}
                onClick={() => onUse(requirementBlock, onClose)}
                isDisabled={disableUseForBlockIds.has(requirementBlock.id)}
              >
                {t("ui.use")}
              </Button>
            )}
          />
        </DrawerContent>
      </Drawer>
    </>
  )
})
