import { Archive, ArrowSquareOut, DotsThree } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IOverheatingTool } from "../../../models/overheating-tool"
import { ManageMenu } from "../../shared/base/manage-menu"
import { ManageMenuItemButton } from "../../shared/base/manage-menu-item"

interface IManageOverheatingToolMenuProps {
  overheatingTool: IOverheatingTool
  onArchive: (id: string) => void
  onDownload: (id: string) => void
}

export const ManageOverheatingToolMenu = observer(function ManageOverheatingToolMenu({
  overheatingTool,
  onDownload,
  onArchive,
}: IManageOverheatingToolMenuProps) {
  const { t } = useTranslation() as any
  return (
    <ManageMenu icon={<DotsThree size={16} />} label={t("ui.actions")}>
      <ManageMenuItemButton leftIcon={<ArrowSquareOut size={16} />} onClick={() => onDownload(overheatingTool.id)}>
        {t("ui.download")}
      </ManageMenuItemButton>
      <ManageMenuItemButton leftIcon={<Archive size={16} />} onClick={() => onArchive(overheatingTool.id)}>
        {t("ui.archive")}
      </ManageMenuItemButton>
    </ManageMenu>
  )
})
