import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  Textarea,
  TextProps,
  VStack,
} from "@chakra-ui/react"
import { faTag } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IRequirementBlockForm } from "./index"

const helperTextStyles: Partial<TextProps> = {
  color: "border.base",
}

export function BlockSetup() {
  const { t } = useTranslation()
  const { register } = useFormContext<IRequirementBlockForm>()

  return (
    <Box as={"section"} w={"300px"} boxShadow={"md"} borderRadius={"xl"} bg={"greys.grey10"} overflow={"hidden"}>
      <Box as={"header"} w={"full"} px={6} py={3} bg={"theme.blueAlt"}>
        <Text as={"h3"} fontSize={"xl"} color={"greys.white"} fontWeight={700}>
          {t("requirementsLibrary.modals.blockSetupTitle")}
        </Text>
      </Box>
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
          <Textarea bg={"white"} {...register("description", { maxLength: 250 })} />
          <FormHelperText {...helperTextStyles}>
            {t("requirementsLibrary.fieldDescriptions.description")} <br />
            {t("requirementsLibrary.descriptionMaxLength")}
          </FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>{t("requirementsLibrary.fields.associations")}</FormLabel>
          <InputGroup>
            <Input bg={"white"} />
            <InputLeftElement>
              <FontAwesomeIcon icon={faTag} style={{ width: "16.7px", height: "16.7px" }} />
            </InputLeftElement>
          </InputGroup>
          <FormHelperText {...helperTextStyles}>
            {t("requirementsLibrary.fieldDescriptions.associations")}
          </FormHelperText>
        </FormControl>
        <FormControl isReadOnly={true}>
          <FormLabel>{t("requirementsLibrary.fields.requirementSku")}</FormLabel>
          <Input bg={"white"} isDisabled={true} />
          <FormHelperText {...helperTextStyles}>
            {t("requirementsLibrary.fieldDescriptions.requirementSku")}
          </FormHelperText>
        </FormControl>
      </VStack>
    </Box>
  )
}
