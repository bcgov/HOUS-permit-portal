import { Box, Button, Divider, Heading, HStack, Stack, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { IRequirementTemplateForm } from "./index"

interface IProps {
  onEdit?: () => void
}

export const SectionsSidebar = observer(function SectionsSidebar({ onEdit }: IProps) {
  const { t } = useTranslation()
  const { watch } = useFormContext<IRequirementTemplateForm>()
  const { requirementBlockStore } = useMst()
  const watchedSections = watch("requirementTemplateSectionsAttributes")

  return (
    <Box
      w={"368px"}
      as={"section"}
      h={"full"}
      borderRight={"1px solid"}
      borderColor={"border.light"}
      boxShadow={"elevations.elevation01"}
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
          return (
            <React.Fragment key={section.id}>
              <Box as={"section"} w={"full"}>
                <Heading
                  as="h3"
                  fontSize={"sm"}
                  fontWeight={700}
                  pl={6}
                  pr={4}
                  py={2}
                  m={0}
                  _hover={{ textDecoration: "underline" }}
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
