import {
  Box,
  Button,
  Center,
  Checkbox,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Text,
  Textarea,
  TextProps,
  Tooltip,
  VStack,
} from "@chakra-ui/react"
import { ArrowCounterClockwise, Info, Trash, Upload } from "@phosphor-icons/react"
import "@uppy/core/dist/style.min.css"
import "@uppy/dashboard/dist/style.css"
import { observer } from "mobx-react-lite"
// import DragDrop from "@uppy/react/lib/DragDrop.js"
import { Icon } from "@chakra-ui/react"
import { UppyFile } from "@uppy/core"
import Dashboard from "@uppy/react/lib/Dashboard.js"
import * as R from "ramda"
import React, { useRef } from "react"
import { Controller, useFieldArray, useFormContext } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import useUppyS3 from "../../../../hooks/use-uppy-s3"
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
  const { register, control, watch, setValue } = useFormContext<IRequirementBlockForm>()
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

  const visibilityBgColor = { any: "greys.grey10", live: "semantic.infoLight", early_access: "semantic.warningLight" }

  const requirementDocumentsAttributes = watch("requirementDocumentsAttributes")

  const { fields, append, remove, update } = useFieldArray({ control, name: "requirementDocumentsAttributes" })

  const handleUploadSuccess = (file: UppyFile<{}, {}>, response: any) => {
    // Create a new document with the uploaded file data
    const parts = response.uploadURL.split("/")
    const key = parts[parts.length - 1]
    const newDocument = {
      // requirementBlockId: requirementBlock?.id, // No requirementBlock ID when creating
      file: {
        id: key,
        storage: "cache",
        metadata: { size: file.size || 0, filename: file.name, mimeType: file.type || "application/octet-stream" },
      },
    }
    // Use append from useFieldArray
    append(newDocument, { shouldFocus: false })
    // Update form state instead of model directly
    // setValue("requirementDocumentsAttributes", [...requirementDocumentsAttributes, newDocument], { shouldDirty: true })
  }

  const handleRemoveFile = (documentId: string) => {
    const index = requirementDocumentsAttributes.findIndex((doc) => (doc.id || doc.file?.id) === documentId)
    if (index !== -1) {
      const doc = requirementDocumentsAttributes[index]
      update(index, { ...doc, _destroy: true })
    }
  }

  const handleUndoRemove = (documentId: string) => {
    const index = requirementDocumentsAttributes.findIndex((doc) => (doc.id || doc.file?.id) === documentId)
    if (index !== -1) {
      const doc = requirementDocumentsAttributes[index]
      update(index, { ...doc, _destroy: false })
    }
  }

  const uppy = useUppyS3({ onUploadSuccess: handleUploadSuccess, maxNumberOfFiles: 10, autoProceed: true })

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
          <FormLabel sx={{ ":after": { content: `"${t("ui.optional")}"`, ml: 1.5 } }}>
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
                  selectedOptions={value.map((association) => ({ value: association, label: association }))}
                  styles={{
                    container: (css, state) => ({ ...css, width: "100%" }),
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
        </FormControl>
        <FormControl>
          <FormLabel>{t("requirementsLibrary.fields.requirementDocuments")}</FormLabel>
          {requirementDocumentsAttributes?.map((doc) => (
            <Flex key={doc.id || doc.file?.id} justifyContent="space-between" alignItems="center" gap={2} mb={1}>
              <Text textDecoration={doc._destroy ? "line-through" : "none"}>{doc.file?.metadata?.filename}</Text>
              {doc._destroy ? (
                <Button
                  variant="link"
                  size="sm"
                  color="semantic.info"
                  leftIcon={<Icon as={ArrowCounterClockwise} />}
                  onClick={() => handleUndoRemove(doc.id || doc.file?.id)}
                >
                  {t("ui.undo")}
                </Button>
              ) : (
                <IconButton
                  aria-label={t("ui.remove")}
                  color="semantic.error"
                  icon={<Icon as={Trash} />}
                  variant="tertiary"
                  size="sm"
                  onClick={() => handleRemoveFile(doc.id || doc.file?.id)}
                />
              )}
            </Flex>
          ))}
          <Box position="relative">
            <Dashboard uppy={uppy} height={300} />
            {R.isEmpty(uppy.getFiles()) && (
              <Center position="absolute" top={"48%"} left={"48%"}>
                <Upload size={24} />
              </Center>
            )}
          </Box>
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
              />
            )}
      </VStack>
    </Box>
  )
})
