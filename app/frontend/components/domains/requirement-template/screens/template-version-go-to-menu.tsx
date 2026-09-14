import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react"
import { CaretDown } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"

interface IProps {
  templateVersionId: string
  requirementTemplateId?: string
  showBuilder: boolean
}

export const TemplateVersionGoToMenu = observer(function TemplateVersionGoToMenu({
  templateVersionId,
  requirementTemplateId,
  showBuilder,
}: IProps) {
  const { t } = useTranslation()

  return (
    <Menu>
      <MenuButton as={Button} variant="secondary" rightIcon={<CaretDown />}>
        {t("templateVersionPreview.goTo.menuLabel")}
      </MenuButton>
      <MenuList>
        <MenuItem as={RouterLink} to={`/template-versions/${templateVersionId}/preview`}>
          {t("templateVersionPreview.goTo.formPreview")}
        </MenuItem>
        {showBuilder && requirementTemplateId && (
          <MenuItem as={RouterLink} to={`/requirement-templates/${requirementTemplateId}/edit`}>
            {t("templateVersionPreview.reviseInBuilder")}
          </MenuItem>
        )}
        <MenuItem as={RouterLink} to="/requirement-templates">
          {t("templateVersionPreview.goTo.catalogue")}
        </MenuItem>
      </MenuList>
    </Menu>
  )
})
