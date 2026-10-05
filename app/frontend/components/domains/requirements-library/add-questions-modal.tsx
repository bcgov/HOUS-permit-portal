import {
  Box,
  Button,
  ButtonProps,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  useDisclosure,
} from "@chakra-ui/react"
import { Plus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { Ref, useRef } from "react"
import { useTranslation } from "react-i18next"
import { useEphemeralMstModel } from "../../../hooks/use-ephemeral-mst-model"
import { IRequirementQuestion } from "../../../models/requirement-question"
import { RequirementQuestionPickerSearchModel } from "../../../models/requirement-question-picker-search"
import { QuestionBankModal } from "../question-bank/question-bank-modal"
import { QuestionsTable } from "../question-bank/questions-table"

interface IProps {
  defaultButtonProps?: Partial<ButtonProps>
  renderTriggerButton?: (props: ButtonProps & { ref: Ref<HTMLElement> }) => JSX.Element
  onUse?: (question: IRequirementQuestion) => void
  disabledQuestionIds?: string[]
  /** Controlled open state — keeps the drawer mounted across empty↔has-fields layout swaps. */
  isOpen?: boolean
  onOpen?: () => void
  onClose?: () => void
  /** When true, only the drawer is rendered (triggers live elsewhere). */
  hideTrigger?: boolean
}

export const AddQuestionsModal = observer(function AddQuestionsModal({
  defaultButtonProps,
  renderTriggerButton,
  onUse,
  disabledQuestionIds = [],
  isOpen: isOpenProp,
  onOpen: onOpenProp,
  onClose: onCloseProp,
  hideTrigger = false,
}: IProps) {
  const { t } = useTranslation()
  const disclosure = useDisclosure()
  const isOpen = isOpenProp ?? disclosure.isOpen
  const onOpen = onOpenProp ?? disclosure.onOpen
  const onClose = onCloseProp ?? disclosure.onClose
  const btnRef = useRef<HTMLButtonElement>()
  const pickerSearch = useEphemeralMstModel(RequirementQuestionPickerSearchModel)

  return (
    <>
      {!hideTrigger &&
        (renderTriggerButton?.({ onClick: onOpen, ref: btnRef }) ?? (
          <Button
            leftIcon={<Plus size={12} />}
            variant={"primary"}
            onClick={onOpen}
            aria-label={t("requirementsLibrary.bankQuestions.addQuestion")}
            {...defaultButtonProps}
          >
            {t("requirementsLibrary.bankQuestions.addQuestion")}
          </Button>
        ))}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent maxW="min(1320px, 95vw)" display="flex" flexDir="column">
          <DrawerCloseButton
            fontSize={"xs"}
            color={"greys.white"}
            top="calc(var(--app-navbar-offset) + var(--chakra-space-5))"
            right={4}
            zIndex={1}
          />
          <DrawerHeader color={"greys.white"} backgroundColor={"theme.blueAlt"} p={6} pt={10} fontSize={"2xl"}>
            {t("requirementsLibrary.bankQuestions.addQuestionsTitle")}
          </DrawerHeader>

          <DrawerBody p={6} display="flex" flexDir="column" minH={0} flex={1}>
            {isOpen && (
              <Box
                border="1px solid"
                borderColor="border.light"
                borderRadius="sm"
                overflow="hidden"
                flex={1}
                minH={0}
                display="flex"
                flexDir="column"
              >
                <QuestionsTable
                  searchModel={pickerSearch}
                  onUse={onUse}
                  disabledQuestionIds={disabledQuestionIds}
                  flex={1}
                  minH={0}
                  p={0}
                  spacing={0}
                  overflow="hidden"
                />
              </Box>
            )}
          </DrawerBody>

          <DrawerFooter
            borderTop="1px solid"
            borderColor="border.light"
            justifyContent="flex-end"
            gap={2}
            px={6}
            py={4}
          >
            <QuestionBankModal
              triggerButtonProps={{ variant: "ghost", fontWeight: "normal" }}
              triggerButtonLabel={t("questionBank.modals.create.newSharedQuestion")}
              onSaved={() => pickerSearch.search()}
            />
            <Button variant="primary" onClick={onClose}>
              {t("ui.close")}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
})
