import { Box, Stack, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { useMst } from "../../../../setup/root"
import { IRequirementTemplateSectionsAttribute } from "../../../../types/api-request"
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
  ({ section, sectionIndex }: { section: IRequirementTemplateSectionsAttribute; sectionIndex: number }) => {
    const { requirementBlockStore } = useMst()
    const { control } = useFormContext<IRequirementTemplateForm>()

    const { fields: sectionBlockFields, append } = useFieldArray({
      name: `requirementTemplateSectionsAttributes.${sectionIndex}.templateSectionBlocksAttributes`,
      control,
    })
    return (
      <Box as={"section"} w={"full"}>
        <Box>
          <Box w={"36px"} border={"4px solid"} borderColor={"theme.yellow"} mb={2} />
          <Text as={"h4"} fontWeight={700} fontSize={"2xl"}>
            {section.name}
          </Text>
          <Stack w={"full"} maxW={"798px"} spacing={6} pl={0} mt={6}>
            {sectionBlockFields.map((sectionBlock, index) => (
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
