import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  Text,
  Textarea,
  TextProps,
  Tooltip,
  VStack,
} from "@chakra-ui/react"
import { Info } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useRef } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { IRequirementBlock } from "../../../../models/requirement-block"
import { useMst } from "../../../../setup/root"
import { ConfirmationModal } from "../../../shared/confirmation-modal"
import { BlockVisibilitySelect } from "../../../shared/select/block-visibility-select"
import { TagsSelect } from "../../../shared/select/selectors/tags-select"
import { BlockSetupOptionsMenu } from "../block-setup-options-menu"
import { IRequirementBlockForm } from "./index"

const helperTextStyles: Partial<TextProps> = {
  color: "border.base",
}

export const BlockSetup = observer(function BlockSetup({
  requirementBlock,
  withOptionsMenu,
  forEarlyAccess,
}: {
  requirementBlock?: IRequirementBlock
  withOptionsMenu?: boolean
  forEarlyAccess?: boolean
}) {
  const { requirementBlockStore } = useMst()
  const { isEditingEarlyAccess } = requirementBlockStore
  const { t } = useTranslation()
  const { register, control, watch } = useFormContext<IRequirementBlockForm>()
  const containerRef = useRef<HTMLDivElement>(null)

  const { requirementTemplateId } = useParams()
  const { requirementTemplateStore } = useMst()
  const requirementTemplate = requirementTemplateStore.getRequirementTemplateById(requirementTemplateId)

  const handleCopyToEarlyAccess = async () => {
    await requirementBlockStore.copyRequirementBlock(requirementBlock, true, requirementTemplate)
  }

  const fetchAssociationOptions = async (query: string) => {
    const associations = await requirementBlockStore.searchAssociations(query)
    return associations.map((association) => ({ value: association, label: association }))
  }

  const visibilityWatch = watch("visibility")

  const visibilityBgColor = {
    any: "greys.grey10",
    live: "semantic.infoLight",
    early_access: "semantic.warningLight",
  }

  return (
    <Box as={"section"} w={"350px"} boxShadow={"md"} borderRadius={"xl"} bg={"greys.grey10"} ref={containerRef}>
      <Box as={"header"} w={"full"} px={6} py={3} bg={"theme.blueAlt"}>
        <Text as={"h3"} fontSize={"xl"} color={"greys.white"} fontWeight={700}>
          {t("requirementsLibrary.modals.blockSetupTitle")}
        </Text>
      </Box>
      <FormControl
        display="flex"
        alignItems={{ sm: "center" }}
        bg={visibilityBgColor[visibilityWatch]}
        px={6}
        py={2}
        gap={2}
        borderBottom="1px solid"
        borderColor="border.light"
        w="full"
        position="relative"
      >
        <HStack gap={1}>
          <FormLabel htmlFor="visibility-selector" fontWeight="bold" m={0} fontSize="sm">
            {t("requirementsLibrary.modals.visibilityLabel")}
          </FormLabel>
          <Tooltip
            label={t("requirementsLibrary.modals.edit.visibilityTooltip")}
            aria-label="Visibility tooltip"
            placement="right"
            hasArrow
          >
            <Info size={15} />
          </Tooltip>
        </HStack>
        <BlockVisibilitySelect name="visibility" forEarlyAccess={forEarlyAccess} />
      </FormControl>
      <VStack spacing={4} w={"full"} alignItems={"flex-start"} px={6} pb={6} pt={3}>
        <Text color={"text.secondary"} fontSize={"sm"} fontWeight={700}>
          {t("requirementsLibrary.modals.internalUse")}
        </Text>
        <FormControl mt={1}>
          <FormLabel>{t("requirementsLibrary.fields.name")}</FormLabel>
          <Input bg={"white"} {...register("name", { required: true })} />
        </FormControl>
        <FormControl>
          <FormLabel>{`${t("requirementsLibrary.fields.description")} ${t("ui.optional")}`}</FormLabel>
          <Textarea
            bg={"white"}
            _hover={{ borderColor: "border.base" }}
            {...register("description", { maxLength: 250 })}
          />
          <FormHelperText {...helperTextStyles}>
            {t("requirementsLibrary.fieldDescriptions.description")} <br />
            {t("requirementsLibrary.descriptionMaxLength")}
          </FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel
            sx={{
              ":after": {
                content: `"${t("ui.optional")}"`,
                ml: 1.5,
              },
            }}
          >
            {t("requirementsLibrary.fields.associations")}
          </FormLabel>
          <Controller
            name="associationList"
            control={control}
            render={({ field: { onChange, value } }) => {
              return (
                <TagsSelect
                  onChange={(options) => onChange(options.map((option) => option.value))}
                  fetchOptions={fetchAssociationOptions}
                  placeholder={undefined}
                  selectedOptions={value.map((association) => ({
                    value: association,
                    label: association,
                  }))}
                  styles={{
                    container: (css, state) => ({
                      ...css,
                      width: "100%",
                    }),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                  menuPortalTarget={document.body}
                />
              )
            }}
          />

          <FormHelperText {...helperTextStyles}>
            {t("requirementsLibrary.fieldDescriptions.associations")}
          </FormHelperText>
        </FormControl>

        <FormControl>
          <Controller
            name="firstNations"
            control={control}
            render={({ field: { onChange, value } }) => {
              return (
                <Checkbox isChecked={value} onChange={onChange}>
                  {t("requirementsLibrary.forFirstNations")}
                </Checkbox>
              )
            }}
          />
        </FormControl>

        <FormControl isReadOnly={true}>
          <FormLabel>{t("requirementsLibrary.fields.requirementSku")}</FormLabel>
          <Input bg={"white"} value={watch("sku")} isDisabled={true} />
          <FormHelperText {...helperTextStyles}>
            {t("requirementsLibrary.fieldDescriptions.requirementSku")}
          </FormHelperText>
        </FormControl>
        {withOptionsMenu
          ? requirementBlock && <BlockSetupOptionsMenu requirementBlock={requirementBlock} />
          : isEditingEarlyAccess && (
              <ConfirmationModal
                title={t("requirementsLibrary.copyToEarlyAccess.title")}
                body={(<Trans i18nKey={"requirementsLibrary.copyToEarlyAccess.body"} />) as unknown as string}
                triggerText={t("ui.proceed")}
                renderTriggerButton={({ onClick, ...rest }) => (
                  <Button variant="primary" onClick={onClick as (e: React.MouseEvent) => Promise<any>} {...rest}>
                    {t("requirementsLibrary.copyToEarlyAccess.title")}
                  </Button>
                )}
                onConfirm={(_onClose) => {
                  handleCopyToEarlyAccess()
                  _onClose()
                }}
                // confirmButtonProps={{
                //   isLoading: false, // Replace with your loading state if needed
                //   isDisabled: false, // Replace with your validation logic if needed
                // }}
              />
            )}
      </VStack>
    </Box>
  )
})
