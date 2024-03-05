import {
  Box,
  Button,
  ButtonGroup,
  ButtonProps,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useController, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IDenormalizedRequirementBlock, IRequirementBlockCustomization } from "../../../../../types/types"
import { Editor } from "../../../../shared/editor/editor"

interface IProps {
  requirementBlock: IDenormalizedRequirementBlock
}

interface ICustomizationForm extends IRequirementBlockCustomization {}

interface IProps {
  requirementBlockCustomization?: IRequirementBlockCustomization
  triggerButtonProps?: Partial<ButtonProps>
  onSave?: (requirementBlockId: string, customization: ICustomizationForm) => void
}

function formFormDefaults(customization: IRequirementBlockCustomization | undefined): ICustomizationForm {
  return {
    tip: customization?.tip,
    electiveFields: customization?.electiveFields,
  }
}

export const JurisdictionRequirementBlockEditSidebar = observer(function JurisdictionRequirementBlockEditSidebar({
  requirementBlock,
  requirementBlockCustomization,
  triggerButtonProps,
  onSave,
}: IProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = React.useRef()
  const { t } = useTranslation()
  const { reset, handleSubmit, control } = useForm<ICustomizationForm>({
    defaultValues: formFormDefaults(requirementBlockCustomization),
  })
  const {
    field: { value: tipValue, onChange: onTipChange },
  } = useController({ control, name: "tip" })

  useEffect(() => {
    if (isOpen) {
      reset(formFormDefaults(requirementBlockCustomization))
    }
  }, [requirementBlockCustomization, isOpen])

  const handleCancel = () => {
    reset(formFormDefaults(requirementBlockCustomization))
    onClose()
  }

  const onSubmit = handleSubmit((data) => {
    onSave(requirementBlock.id, data)
    onClose()
  })

  return (
    <>
      <Button
        ref={btnRef}
        variant={"link"}
        color={"text.primary"}
        textDecoration={"none"}
        onClick={(e) => {
          e.stopPropagation()
          onOpen()
        }}
        textOverflow={"ellipsis"}
        overflow={"hidden"}
        whiteSpace={"nowrap"}
        {...triggerButtonProps}
      >
        {t("ui.edit")}
      </Button>
      <Drawer isOpen={isOpen} placement="right" onClose={handleCancel} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent maxW="430px">
          <DrawerCloseButton />
          <DrawerHeader mt={4} px={8} pb={0} borderColor={"border.light"}>
            <Text as="h2" fontWeight={700} fontSize={"2xl"}>
              {requirementBlock.displayName}
            </Text>
          </DrawerHeader>

          <DrawerBody px={8}>
            <Stack w={"full"} spacing={6}>
              <Text color={"text.secondary"} fontSize={"sm"}>
                {t("digitalBuildingPermits.edit.requirementBlockSidebar.description")}
              </Text>
              <Box sx={{ ".ql-container": { h: "112px" } }}>
                <Text mb={1}>{t("digitalBuildingPermits.edit.requirementBlockSidebar.tipLabel")}</Text>
                <Editor htmlValue={tipValue} onChange={onTipChange} />
              </Box>
              <ButtonGroup size={"md"}>
                <Button
                  variant={"primary"}
                  flex={1}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSubmit()
                  }}
                >
                  {t("ui.done")}
                </Button>
                <Button variant={"secondary"} flex={1} onClick={handleCancel}>
                  {t("ui.cancel")}
                </Button>
              </ButtonGroup>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
})
