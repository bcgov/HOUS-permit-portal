import { Box, Flex, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { ERequirementType } from "../../../../types/enums"
import { EditableInputWithControls } from "../../../shared/editable-input-with-controls"
import { FieldsSetupDrawer } from "../fields-setup-drawer"
import { IRequirementBlockForm } from "./index"

export const FieldsSetup = observer(function FieldsSetup() {
  const { t } = useTranslation()
  const { control, register, watch } = useFormContext<IRequirementBlockForm>()
  const { fields, append } = useFieldArray<IRequirementBlockForm>({
    control,
    name: "requirementBlockRequirementsAttributes",
  })

  const onUseRequirement = (requirementType: ERequirementType) => {
    append({
      requirementAttribute: {
        inputType: requirementType,
      },
    })
  }

  const watchedDisplayName = watch("displayName")

  const hasFields = fields.length > 0
  return (
    <Flex as={"section"} flexDir={"column"} flex={1} h={"full"} alignItems={"flex-start"}>
      <Text color={"text.primary"} fontSize={"sm"}>
        {t("requirementsLibrary.modals.configureFields")}
      </Text>

      {!hasFields && (
        <Box
          as={"section"}
          px={6}
          py={"1.875rem"}
          w={"full"}
          border={"1px solid"}
          borderColor={"border.light"}
          borderRadius={"sm"}
          mt={4}
        >
          <Flex w={"full"} justifyContent={"space-between"}>
            <Text>{t("requirementsLibrary.modals.noFormFieldsAdded")}</Text>
            <FieldsSetupDrawer onUse={onUseRequirement} />
          </Flex>
        </Box>
      )}
      {hasFields && (
        <Box as={"section"} w={"full"} border={"1px solid"} borderColor={"border.light"} borderRadius={"sm"} mt={4}>
          <Flex py={3} px={6} w={"full"} background={"greys.grey04"}>
            <EditableInputWithControls
              initialHint={t("requirementsLibrary.modals.clickToWriteDisplayName")}
              editableInputProps={register("displayName", { required: true })}
              color={R.isEmpty(watchedDisplayName) ? "text.link" : undefined}
            />
          </Flex>
        </Box>
      )}
    </Flex>
  )
})
