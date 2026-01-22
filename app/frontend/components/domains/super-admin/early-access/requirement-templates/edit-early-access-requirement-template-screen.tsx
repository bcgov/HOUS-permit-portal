import {
  Button,
  Checkbox,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  VStack,
  useDisclosure,
} from "@chakra-ui/react"
import { Archive, ArrowSquareOut, CaretDown, PencilSimple } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMst } from "../../../../../setup/root"
import { AsyncRadioGroup } from "../../../../shared/base/inputs/async-radio-group"
import { ConfirmationModal } from "../../../../shared/confirmation-modal"
import {
  BaseEditRequirementTemplateScreen,
  IEditRequirementActionsProps,
  IEditRequirementOptionsProps,
} from "../../../requirement-template/screens/base-edit-requirement-template-screen"
import { SharePreviewPopover } from "../../../requirement-template/share-preview-popover"

export const EditEarlyAccessRequirementTemplateScreen = observer(function EditEarlyAccessRequirementTemplateScreen() {
  const { requirementBlockStore } = useMst()
  const { setIsEditingEarlyAccess, resetIsEditingEarlyAccess } = requirementBlockStore

  useEffect(() => {
    setIsEditingEarlyAccess(true)

    return () => {
      resetIsEditingEarlyAccess()
    }
  }, [])

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
        <EditClassificationsModal
          renderTrigger={(props) => (
            <MenuItem icon={<PencilSimple />} {...props}>
              {t("ui.edit")} {t("siteConfiguration.permitClassifications.title")}
            </MenuItem>
          )}
        />
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

const EditClassificationsModal = observer(({ renderTrigger }: { renderTrigger: (props: any) => React.ReactNode }) => {
  const { t } = useTranslation()
  const {
    permitClassificationStore: { fetchPermitTypeOptions, fetchActivityOptions },
  } = useMst()
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      {renderTrigger({ onClick: onOpen })}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("siteConfiguration.permitClassifications.title")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={8}>
            <VStack gap={4} align="stretch">
              <AsyncRadioGroup
                valueField="id"
                label={t("requirementTemplate.fields.permitType")}
                fetchOptions={fetchPermitTypeOptions}
                fieldName={"permitTypeId"}
              />
              <AsyncRadioGroup
                valueField="id"
                label={t("requirementTemplate.fields.activity")}
                fetchOptions={fetchActivityOptions}
                fieldName={"activityId"}
              />
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
})

const EditEarlyAccessRequirementActions = ({ requirementTemplate, onSaveDraft }: IEditRequirementActionsProps) => {
  const { t } = useTranslation()
  const { control } = useFormContext()
  const navigate = useNavigate()

  const handleClick = () => {
    ;(async () => {
      await onSaveDraft()
      navigate(`/early-access/requirement-templates/${requirementTemplate.id}`)
    })()
  }

  return (
    <>
      <Controller
        name="public"
        control={control}
        render={({ field }) => (
          <Checkbox isChecked={field.value} onChange={field.onChange} borderColor={"border.input"}>
            {t("earlyAccessRequirementTemplate.edit.public")}
          </Checkbox>
        )}
      />
      <SharePreviewPopover earlyAccessRequirementTemplate={requirementTemplate} variant="primary" />
      <Button rightIcon={<ArrowSquareOut />} variant="secondary" onClick={handleClick}>
        {t("ui.view")}
      </Button>
    </>
  )
}
