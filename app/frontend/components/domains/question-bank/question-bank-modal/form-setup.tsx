import {
  Box,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Text,
  TextProps,
  Textarea,
  VStack,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { CopyableValue } from "../../../shared/base/copyable-value"
import { TagsSelect } from "../../../shared/select/selectors/tags-select"
import { IRequirementQuestionForm } from "./index"

const helperTextStyles: Partial<TextProps> = {
  color: "border.base",
}

export const FormSetup = observer(function FormSetup() {
  const { requirementQuestionStore } = useMst()
  const { t } = useTranslation()
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<IRequirementQuestionForm>()

  const fetchAssociationOptions = async (query: string) => {
    const associations = await requirementQuestionStore.searchAssociations(query)
    return associations.map((association: string) => ({ value: association, label: association }))
  }

  const questionId = watch("id")

  return (
    <Box as={"section"} w={"350px"} boxShadow={"md"} borderRadius={"xl"} bg={"greys.grey10"} flexShrink={0}>
      <Box as={"header"} w={"full"} px={6} py={3} bg={"theme.blueAlt"}>
        <Text as={"h3"} fontSize={"xl"} color={"greys.white"} fontWeight={700}>
          {t("questionBank.modals.formSetupTitle")}
        </Text>
      </Box>
      <VStack spacing={4} w={"full"} alignItems={"flex-start"} px={6} pb={6} pt={3}>
        <Text color={"text.secondary"} fontSize={"sm"} fontWeight={700}>
          {t("questionBank.modals.internalUse")}
        </Text>
        <FormControl mt={1} isInvalid={!!errors.name}>
          <FormLabel>{t("questionBank.fields.name")}</FormLabel>
          <Input bg={"white"} {...register("name", { required: true })} />
          {errors.name && (
            <FormErrorMessage>{t("ui.isRequired", { field: t("questionBank.fields.name") })}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl>
          <FormLabel>{`${t("questionBank.fields.description")} ${t("ui.optional")}`}</FormLabel>
          <Textarea
            bg={"white"}
            _hover={{ borderColor: "border.base" }}
            {...register("description", { maxLength: 250 })}
          />
          <FormHelperText {...helperTextStyles}>
            {t("questionBank.fieldDescriptions.description")} <br />
            {t("questionBank.descriptionMaxLength")}
          </FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel sx={{ ":after": { content: `"${t("ui.optional")}"`, ml: 1.5 } }}>
            {t("questionBank.fields.associations")}
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
                  selectedOptions={(value || []).map((association) => ({
                    value: association,
                    label: association,
                  }))}
                  styles={{
                    container: (css) => ({ ...css, width: "100%" }),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                  menuPortalTarget={document.body}
                />
              )
            }}
          />
          <FormHelperText {...helperTextStyles}>{t("questionBank.fieldDescriptions.associations")}</FormHelperText>
        </FormControl>
        <FormControl isReadOnly={true}>
          <FormLabel>{t("questionBank.fields.questionUuid")}</FormLabel>
          <CopyableValue
            value={questionId || ""}
            CustomDisplay={() => <Input flex={1} bg={"greys.grey04"} value={questionId} isDisabled={true} />}
            iconButtonProps={{ color: "text.link", alignSelf: "center" }}
            w={"full"}
            alignItems={"center"}
          />
          <FormHelperText {...helperTextStyles}>{t("questionBank.fieldDescriptions.questionUuid")}</FormHelperText>
        </FormControl>
      </VStack>
    </Box>
  )
})
