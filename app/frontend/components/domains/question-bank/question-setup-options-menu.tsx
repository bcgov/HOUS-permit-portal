import { Button, Menu, MenuButton, MenuList } from "@chakra-ui/react"
import { Archive, CaretDown, ClockClockwise } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { IRequirementQuestion } from "../../../models/requirement-question"
import { useMst } from "../../../setup/root"
import { ManageMenuItemButton } from "../../shared/base/manage-menu-item"
import { ConfirmationModal } from "../../shared/confirmation-modal"

interface IQuestionSetupOptionsMenuProps {
  requirementQuestion: IRequirementQuestion
}

export const QuestionSetupOptionsMenu = observer(function QuestionSetupOptionsMenu({
  requirementQuestion,
}: IQuestionSetupOptionsMenuProps) {
  const { requirementQuestionStore } = useMst()

  const handleArchive = async () => {
    if (await requirementQuestion.destroy()) await requirementQuestionStore.search()
  }

  const handleRestore = async () => {
    if (await requirementQuestion.restore()) await requirementQuestionStore.search()
  }

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="link"
        color={"text.primary"}
        textDecoration={"none"}
        _hover={{
          textDecoration: "underline",
        }}
        rightIcon={<CaretDown />}
        h={6}
      >
        {t("questionBank.modals.edit.options")}
      </MenuButton>

      <MenuList>
        {requirementQuestion.isDiscarded ? (
          <ConfirmationModal
            title={t("ui.confirmRestore")}
            onConfirm={async (closeModal) => {
              await handleRestore()
              closeModal()
            }}
            renderTriggerButton={(props) => (
              <ManageMenuItemButton color="semantic.success" leftIcon={<ClockClockwise size={16} />} {...props}>
                {t("ui.restore")}
              </ManageMenuItemButton>
            )}
            renderConfirmationButton={(props) => (
              <Button {...props} colorScheme="green">
                {t("ui.restore")}
              </Button>
            )}
          />
        ) : (
          <ConfirmationModal
            title={t("questionBank.modals.edit.archiveConfirmationModal.title")}
            body={t("questionBank.modals.edit.archiveConfirmationModal.body")}
            onConfirm={async (closeModal) => {
              await handleArchive()
              closeModal()
            }}
            renderTriggerButton={(props) => (
              <ManageMenuItemButton color="semantic.error" leftIcon={<Archive size={16} />} {...props}>
                {t("ui.archive")}
              </ManageMenuItemButton>
            )}
            renderConfirmationButton={(props) => (
              <Button {...props} colorScheme="red">
                {t("ui.archive")}
              </Button>
            )}
          />
        )}
      </MenuList>
    </Menu>
  )
})
