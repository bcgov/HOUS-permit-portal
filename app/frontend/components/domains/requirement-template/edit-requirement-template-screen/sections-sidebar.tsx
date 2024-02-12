import { Box, Button, Divider, Heading, HeadingProps, HStack, Stack, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { IRequirementTemplateForm } from "./index"

interface IProps {
  onEdit?: () => void
  onItemClick?: (id: string) => void
  sectionIdToHighlight: null | string
}

export const SectionsSidebar = observer(function SectionsSidebar({
  onEdit,
  onItemClick,
  sectionIdToHighlight,
}: IProps) {
  const { t } = useTranslation()
  const { watch } = useFormContext<IRequirementTemplateForm>()
  const { requirementBlockStore } = useMst()
  const watchedSections = watch("requirementTemplateSectionsAttributes")
  const highLightedSectionStyles: Partial<HeadingProps> = {
    bg: "theme.blueLight",
    color: "text.link",
    borderLeft: "4px solid",
    borderColor: "theme.blueAlt",
  }

  return (
    <Box
      w={"368px"}
      as={"section"}
      h={"full"}
      borderRight={"1px solid"}
      borderColor={"border.light"}
      boxShadow={"elevations.elevation01"}
      overflow={"auto"}
    >
      <HStack w={"full"} justifyContent={"space-between"} bg={"greys.grey03"} py={5} px={4}>
        <Text as={"h3"} fontSize={"sm"} fontWeight={400} color={"text.secondary"} textTransform={"uppercase"}>
          {t("requirementTemplate.edit.sectionsSidebarTitle")}
        </Text>
        <Button variant={"secondary"} onClick={onEdit} size={"sm"}>
          {t("requirementTemplate.edit.reorderButton")}
        </Button>
      </HStack>
      <Stack w={"full"} spacing={4} alignItems={"flex-start"} py={2}>
        {watchedSections?.map((section, index) => {
          const isHighlightedSection = sectionIdToHighlight === section.id
          return (
            <React.Fragment key={section.id}>
              <Box as={"section"} w={"full"}>
                <Heading
                  fontSize={"sm"}
                  fontWeight={700}
                  pl={6}
                  pr={4}
                  py={2}
                  m={0}
                  _hover={{ textDecoration: "underline" }}
                  onClick={() => onItemClick?.(section.id)}
                  cursor={"pointer"}
                  {...(isHighlightedSection ? highLightedSectionStyles : {})}
                >
                  {section.name}
                </Heading>
                {section.templateSectionBlocksAttributes.length > 0 && (
                  <Box as={"ol"} sx={{ listStyle: "none" }} w={"full"} p={0} m={0}>
                    {section.templateSectionBlocksAttributes.map((sectionBlock) => {
                      return (
                        <Text
                          as={"li"}
                          key={sectionBlock.id}
                          pl={6}
                          pr={4}
                          py={2}
                          _hover={{ textDecoration: "underline" }}
                          onClick={() => onItemClick?.(sectionBlock.id)}
                          cursor={"pointer"}
                        >
                          {requirementBlockStore?.getRequirementBlockById(sectionBlock.requirementBlockId)?.name}
                        </Text>
                      )
                    })}
                  </Box>
                )}
              </Box>
              {index < watchedSections.length - 1 && <Divider borderColor={"border.light"} m={0} />}
            </React.Fragment>
          )
        })}
      </Stack>
    </Box>
  )
})
