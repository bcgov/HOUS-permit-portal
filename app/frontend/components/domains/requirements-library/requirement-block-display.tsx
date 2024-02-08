import { Box, BoxProps, HStack, IconButton, Text, VStack } from "@chakra-ui/react"
import { X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IRequirementBlock } from "../../../models/requirement-block"
import { ERequirementType } from "../../../types/enums"
import { isQuillEmpty } from "../../../utils/utility-funcitons"
import { EditorWithPreview } from "../../shared/editor/custom-extensions/editor-with-preview"
import { RequirementFieldDisplay } from "./requirement-field-display"

interface IProps extends BoxProps {
  requirementBlock: IRequirementBlock
  onRemove?: () => void
}

export const RequirementBlockDisplay = observer(function RequirementBlockDisplay({
  requirementBlock,
  onRemove,
  ...containerProps
}: IProps) {
  const { t } = useTranslation()

  return (
    <Box
      as={"section"}
      w={"full"}
      border={"1px solid"}
      borderColor={"border.light"}
      borderRadius={"lg"}
      {...containerProps}
    >
      <HStack spacing={0} py={3} px={6} w={"full"} background={"greys.grey04"}>
        <Text as={"h5"} fontWeight={700} fontSize={"base"}>
          {requirementBlock.displayName}
        </Text>
        {onRemove && (
          <IconButton
            color={"text.primary"}
            variant={"ghost"}
            aria-label={"Remove Requirement Block"}
            onClick={onRemove}
            icon={<X size={16} />}
          />
        )}
      </HStack>
      <Box pb={8}>
        <Box px={3}>
          {!isQuillEmpty(requirementBlock.displayDescription) && (
            <EditorWithPreview
              containerProps={{
                mt: 2,
                mb: 1,
                py: 0,
              }}
              isReadOnly
              label={t("requirementsLibrary.modals.displayDescriptionLabel")}
              htmlValue={requirementBlock.displayDescription}
              initialTriggerText={t("requirementsLibrary.modals.addDescriptionTrigger")}
            />
          )}
        </Box>
        <VStack
          w={"full"}
          alignItems={"flex-start"}
          spacing={2}
          px={3}
          mt={isQuillEmpty(requirementBlock.displayDescription) ? 5 : 0}
        >
          {requirementBlock.requirements.map((requirement, index) => {
            const requirementType = requirement.inputType
            return (
              <Box
                key={requirement.id}
                w={"full"}
                borderRadius={"sm"}
                px={3}
                pt={index !== 0 ? 1 : 0}
                pb={5}
                pos={"relative"}
              >
                <Box
                  w={"full"}
                  sx={{
                    "& input": {
                      maxW: "339px",
                    },
                  }}
                >
                  <RequirementFieldDisplay
                    requirementType={requirementType}
                    label={requirement.label}
                    helperText={requirementBlock.hint}
                    unit={requirementType === ERequirementType.number ? requirement?.numberUnit ?? null : undefined}
                    options={requirement?.valueOptions?.map((option) => option.label)}
                    selectProps={{
                      maxW: "339px",
                    }}
                  />
                </Box>
              </Box>
            )
          })}
        </VStack>
      </Box>
    </Box>
  )
})
