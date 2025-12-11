import { Button, Menu, MenuButton, MenuList } from "@chakra-ui/react"
import { DotsThree, Download } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { IPdfForm } from "../../../models/pdf-form"
import { ManageMenuItemButton } from "../../shared/base/manage-menu-item"

interface IManagePdfFormMenuProps {
  pdfForm: IPdfForm
  onDownload: (id: string) => void
}

export const ManagePdfFormMenu = observer(function ManagePdfFormMenu({ pdfForm, onDownload }: IManagePdfFormMenuProps) {
  const handleDownload = () => {
    onDownload(pdfForm.id)
  }

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="ghost"
        size="sm"
        aria-label="More actions"
        _hover={{ bg: "gray.100" }}
        _active={{ bg: "gray.200" }}
      >
        <DotsThree size={16} />
      </MenuButton>
      <MenuList minW="160px">
        <ManageMenuItemButton leftIcon={<Download size={16} />} onClick={handleDownload}>
          {t("singleZoneCoolingHeatingTool.downloadPdf")}
        </ManageMenuItemButton>
      </MenuList>
    </Menu>
  )
})
