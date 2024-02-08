import { Box, Stack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { IRequirementTemplateSectionAttributes } from "../../../../types/api-request"
import { EditableInputWithControls } from "../../../shared/editable-input-with-controls"
import { RequirementBlockDisplay } from "../../requirements-library/requirement-block-display"
import { RequirementsLibraryDrawer } from "../../requirements-library/requirements-library-drawer"
import { IRequirementTemplateForm } from "./index"

export const SectionsDisplay = observer(function SectionsDisplay() {
  const { watch } = useFormContext<IRequirementTemplateForm>()
  const watchedSections = watch("requirementTemplateSectionsAttributes")

  return (
    <Stack w={"full"} alignItems={"flex-start"} spacing={16} p={16}>
      {watchedSections.map((section, index) => (
        <SectionDisplay key={section.id} section={section} sectionIndex={index} />
      ))}
    </Stack>
  )
})

const SectionDisplay = observer(
  ({ section, sectionIndex }: { section: IRequirementTemplateSectionAttributes; sectionIndex: number }) => {
    const { requirementBlockStore } = useMst()
    const { control, watch, register, setValue } = useFormContext<IRequirementTemplateForm>()
    const { t } = useTranslation()

    const { append } = useFieldArray({
      name: `requirementTemplateSectionsAttributes.${sectionIndex}.templateSectionBlocksAttributes`,
      control,
    })

    const watchedSectionBlocks = watch(
      `requirementTemplateSectionsAttributes.${sectionIndex}.templateSectionBlocksAttributes`
    )

    const watchedSectionName = watch(`requirementTemplateSectionsAttributes.${sectionIndex}.name`)
    return (
      <Box as={"section"} w={"full"}>
        <Box>
          <Box w={"36px"} border={"4px solid"} borderColor={"theme.yellow"} mb={2} />
          <EditableInputWithControls
            aria-role={"heading"}
            aria-level={4}
            w={"fit-content"}
            fontWeight={700}
            fontSize={"2xl"}
            initialHint={t("ui.clickToEdit")}
            value={watchedSectionName || ""}
            editableInputProps={{
              ...register(`requirementTemplateSectionsAttributes.${sectionIndex}.name`, { required: true }),
              "aria-label": "Edit Section Name",
            }}
            color={R.isEmpty(watchedSectionName) ? "text.link" : undefined}
            aria-label={"Edit Section Name"}
            onCancel={(previousValue) =>
              setValue(`requirementTemplateSectionsAttributes.${sectionIndex}.name`, previousValue)
            }
          />
          <Stack w={"full"} maxW={"798px"} spacing={6} pl={0} mt={6}>
            {watchedSectionBlocks.map((sectionBlock, index) => (
              <RequirementBlockDisplay
                as={"section"}
                key={sectionBlock.id}
                requirementBlock={requirementBlockStore.getRequirementBlockById(sectionBlock.requirementBlockId)}
              />
            ))}
            <RequirementsLibraryDrawer
              defaultButtonProps={{ alignSelf: "center" }}
              onUse={(requirementBlock, closeDrawer) => {
                append({ requirementBlockId: requirementBlock.id })
                closeDrawer()
              }}
            />
          </Stack>
        </Box>
      </Box>
    )
  }
)
