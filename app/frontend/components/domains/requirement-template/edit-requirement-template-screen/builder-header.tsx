import { Container, Heading, HStack, Tag, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IRequirementTemplate } from "../../../../models/requirement-template"
import { EditableInputWithControls } from "../../../shared/editable-input-with-controls"
import { TemplateStatusTag } from "../../../shared/requirement-template/template-status-tag"
import { SubNavBar } from "../../navigation/sub-nav-bar"
import { IRequirementTemplateForm } from "./index"

interface IProps {
  requirementTemplate: IRequirementTemplate
}

// TODO: remove stub version when versioning is implemented
const stubVersion = "v.2024.01.01"
export const BuilderHeader = observer(function BuilderHeader({ requirementTemplate }: IProps) {
  const { t } = useTranslation()
  const { register, watch, setValue } = useFormContext<IRequirementTemplateForm>()
  const watchedDescription = watch("description")
  return (
    <Container as={"header"} maxW={"container.lg"} px={8}>
      <HStack justifyContent={"space-between"}>
        <SubNavBar
          staticBreadCrumbs={[
            {
              href: "/requirement-templates",
              title: t("site.breadcrumb.requirementTemplates"),
            },
            {
              href: `/requirements-template${requirementTemplate.id}/edit`,
              title: t("site.breadcrumb.editTemplate"),
            },
          ]}
          breadCrumbContainerProps={{ px: 0, sx: { ol: { pl: 0 } }, minW: undefined }}
          borderBottom={"none"}
          h={"fit-content"}
          w={"fit-content"}
        />
        <Text as={"h2"} fontWeight={400} fontSize={"sm"} color={"greys.grey01"}>
          {t("requirementTemplate.edit.title")}
        </Text>
      </HStack>
      <VStack spacing={2} w={"full"} alignItems={"flex-start"} py={5}>
        <Heading color={"text.primary"}>
          {requirementTemplate.permitType.name} | {requirementTemplate.activity.name}
        </Heading>
        <HStack>
          <Text fontWeight={700}>{t("requirementTemplate.fields.description")}:</Text>
          <EditableInputWithControls
            initialHint={t("requirementsLibrary.modals.clickToWriteDisplayName")}
            value={watchedDescription || ""}
            editableInputProps={{
              ...register("description"),
              "aria-label": "Edit Template Description",
            }}
            color={R.isEmpty(watchedDescription) ? "text.link" : undefined}
            aria-label={"Edit Template Description"}
            onCancel={(previousValue) => setValue("description", previousValue)}
          />
        </HStack>
        <HStack>
          <TemplateStatusTag requirementTemplate={requirementTemplate} />
          <Tag py={1} px={2} borderRadius="sm" backgroundColor={"greys.grey03"} color={"text.secondary"}>
            {stubVersion}
          </Tag>
        </HStack>
      </VStack>
    </Container>
  )
})
