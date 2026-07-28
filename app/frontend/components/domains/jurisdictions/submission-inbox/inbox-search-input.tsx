import React from "react"
import { ISearch } from "../../../../lib/create-search-model"
import { ModelSearchInput } from "../../../shared/base/model-search-input"

interface IProps {
  placeholder: string
  searchModel: ISearch
}

export const InboxSearchInput = ({ placeholder, searchModel }: IProps) => (
  <ModelSearchInput
    searchModel={searchModel}
    inputGroupProps={{ width: "full" }}
    inputProps={{ placeholder, width: "full", borderColor: "border.light" }}
  />
)
