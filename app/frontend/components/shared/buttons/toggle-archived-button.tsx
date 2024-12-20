import { Button, ButtonProps } from "@chakra-ui/react"
import { Archive } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { ISearch } from "../../../lib/create-search-model"

interface IToggleArchivedButton<TSearchModel extends ISearch> extends ButtonProps {
  searchModel: TSearchModel
}

export const ToggleArchivedButton = observer(function ToggleArchivedButton<TSearchModel extends ISearch>({
  searchModel,
  ...rest
}: IToggleArchivedButton<TSearchModel>) {
  const { showArchived, toggleShowArchived, search } = searchModel

  const handleClick = () => {
    toggleShowArchived()
    search()
  }

  return (
    <Button leftIcon={<Archive size={16} />} variant={"secondary"} onClick={handleClick} {...rest}>
      {showArchived ? t("ui.seeUnarchivedButton") : t("ui.seeArchivedButton")}
    </Button>
  )
})
