import { Button, Flex, HStack, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Text } from "@chakra-ui/react"
import { Archive, ArrowSquareOut, ArrowsClockwise, CaretDown } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { ConfirmationModal } from "../../../../shared/confirmation-modal"
import {
  BaseEditRequirementTemplateScreen,
  IEditRequirementActionsProps,
  IEditRequirementOptionsProps,
} from "../../../requirement-template/screens/base-edit-requirement-template-screen"

export const EditEarlyAccessRequirementTemplateScreen = observer(function EditEarlyAccessRequirementTemplateScreen() {
  return (
    <BaseEditRequirementTemplateScreen
      renderOptionsMenu={EditEarlyAccessRequirementOptions}
      renderActions={EditEarlyAccessRequirementActions}
    />
  )
})

const EditEarlyAccessRequirementOptions = ({ requirementTemplate }: IEditRequirementOptionsProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleFetchLatest = () => {
    // TODO: Fetch latest from non-preview template
  }

  const handleRemove = async () => {
    if (await requirementTemplate.destroy()) navigate("/early-access/requirement-templates")
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
        {t("ui.options")}
      </MenuButton>

      <MenuList pt={0}>
        <MenuItem bg="semantic.warningLight" onClick={null}>
          <HStack gap={6}>
            <Flex direction="column" gap={0}>
              <Text>{t("earlyAccessRequirementTemplate.edit.lastFetched")}:</Text>
              <Text>
                {requirementTemplate?.fetchedAt ? format(requirementTemplate.fetchedAt, "yyyy-MM-dd") : t("ui.na")}
              </Text>
            </Flex>
            <Button variant="primary" onClick={handleFetchLatest} leftIcon={<ArrowsClockwise />}>
              {t("earlyAccessRequirementTemplate.edit.fetchLatest")}
            </Button>
          </HStack>
        </MenuItem>
        <MenuDivider my={0} borderColor="border.light" />
        <MenuDivider my={0} borderColor="border.light" />
        <ConfirmationModal
          title={t("earlyAccessRequirementTemplate.edit.confirmRemoveModalTitle")}
          body={t("earlyAccessRequirementTemplate.edit.confirmRemoveModalBody")}
          onConfirm={(closeModal) => {
            handleRemove()
            closeModal()
          }}
          renderTriggerButton={(props) => (
            <MenuItem color="semantic.error" icon={<Archive />} {...props}>
              {t("ui.archive")}
            </MenuItem>
          )}
          renderConfirmationButton={(props) => (
            <Button variant="secondary" color="semantic.error" leftIcon={<Archive />} {...props}>
              {t("ui.archive")}
            </Button>
          )}
        />
      </MenuList>
    </Menu>
  )
}

const EditEarlyAccessRequirementActions = ({ requirementTemplate }: IEditRequirementActionsProps) => {
  const { t } = useTranslation()

  return (
    <>
      <Button variant="primary">
        {t("ui.share")} ({requirementTemplate.numberSharedWith})
      </Button>
      <Button variant="secondary" rightIcon={<ArrowSquareOut />}>
        {t("ui.view")}
      </Button>
    </>
  )
}
