import {
  Button,
  ButtonProps,
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  useDisclosure,
} from "@chakra-ui/react"
import { LinkSimple } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { Ref, useRef } from "react"
import { useTranslation } from "react-i18next"
import { IRequirementQuestion } from "../../../models/requirement-question"
import { RequirementQuestionsTable } from "./requirement-questions-table"

interface IProps {
  defaultButtonProps?: Partial<ButtonProps>
  renderTriggerButton?: (props: ButtonProps & { ref: Ref<HTMLElement> }) => JSX.Element
  onUse?: (requirementQuestion: IRequirementQuestion, closeDrawer?: () => void) => void
}

export const RequirementQuestionsLibraryDrawer = observer(function RequirementQuestionsLibraryDrawer({
  defaultButtonProps,
  renderTriggerButton,
  onUse,
}: IProps) {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef<HTMLButtonElement>()

  return (
    <>
      {renderTriggerButton?.({ onClick: onOpen, ref: btnRef }) ?? (
        <Button
          leftIcon={<LinkSimple size={12} />}
          variant={"secondary"}
          onClick={onOpen}
          aria-label={"use shared question"}
          {...defaultButtonProps}
        >
          {t("requirementsLibrary.sharedQuestions.useSharedQuestion")}
        </Button>
      )}
      <Drawer
        id="add-shared-question-drawer"
        isOpen={isOpen}
        onClose={onClose}
        finalFocusRef={btnRef}
        placement={"right"}
      >
        <DrawerOverlay />
        <DrawerContent display={"flex"} flexDir={"column"} maxW={"80%"} h={"full"} p={8}>
          <DrawerCloseButton fontSize={"xs"} />
          <RequirementQuestionsTable
            h={"calc(100% - 120px)"}
            flex={1}
            p={0}
            onUse={(question) => onUse?.(question, onClose)}
          />
        </DrawerContent>
      </Drawer>
    </>
  )
})
