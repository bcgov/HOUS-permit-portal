import { Container, Heading } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { IRequirementTemplate } from "../../../models/requirement-template"
import { ERequirementTemplateType } from "../../../types/enums"
import { RequirementTemplateForm } from "../../shared/requirement-template/requirement-template-form"

export const NewRequirementTemplateScreen = observer(() => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleSuccess = (createdRequirementTemplate: IRequirementTemplate) => {
    navigate(`/requirement-templates/${createdRequirementTemplate.id}/edit`)
  }

  return (
    <Container maxW="container.lg" p={8} as="main">
      <Heading as="h1" alignSelf="center">
        {t("requirementTemplate.new.title")}
      </Heading>
      <RequirementTemplateForm type={ERequirementTemplateType.LiveRequirementTemplate} onSuccess={handleSuccess} />
    </Container>
  )
})
