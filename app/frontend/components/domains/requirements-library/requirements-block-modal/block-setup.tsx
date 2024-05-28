import { Box, FormControl, FormHelperText, FormLabel, Input, Text, Textarea, TextProps, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useRef } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { TagsSelect } from "../../../shared/select/selectors/tags-select"
import { IRequirementBlockForm } from "./index"

const helperTextStyles: Partial<TextProps> = {
  color: "border.base",
}

export const BlockSetup = observer(function BlockSetup() {
  const { requirementBlockStore } = useMst()
  const { t } = useTranslation()
  const { register, control, watch } = useFormContext<IRequirementBlockForm>()
  const containerRef = useRef<HTMLDivElement>(null)

  const fetchAssociationOptions = async (query: string) => {
    const associations = await requirementBlockStore.searchAssociations(query)
    return associations.map((association) => ({ value: association, label: association }))
  }

  return (
    <Box
      as={"section"}
      w={"300px"}
      boxShadow={"md"}
      borderRadius={"xl"}
      bg={"greys.grey10"}
      overflow={"hidden"}
      ref={containerRef}
    >
      <Box as={"header"} w={"full"} px={6} py={3} bg={"theme.blueAlt"}>
        <Text as={"h3"} fontSize={"xl"} color={"greys.white"} fontWeight={700}>
          {t("requirementsLibrary.modals.blockSetupTitle")}
        </Text>
      </Box>
      <VStack spacing={4} w={"full"} alignItems={"flex-start"} px={6} pb={6} pt={3}>
        <Text color={"text.secondary"} fontSize={"sm"} fontWeight={700}>
          {t("requirementsLibrary.modals.internalUse")}
        </Text>
        <FormControl mt={1} isRequired>
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
          <FormLabel>{t("requirementsLibrary.fields.associations")}</FormLabel>
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
        <FormControl isReadOnly={true}>
          <FormLabel>{t("requirementsLibrary.fields.requirementSku")}</FormLabel>
          <Input bg={"white"} value={watch("sku")} isDisabled={true} />
          <FormHelperText {...helperTextStyles}>
            {t("requirementsLibrary.fieldDescriptions.requirementSku")}
          </FormHelperText>
        </FormControl>
      </VStack>
    </Box>
  )
})
