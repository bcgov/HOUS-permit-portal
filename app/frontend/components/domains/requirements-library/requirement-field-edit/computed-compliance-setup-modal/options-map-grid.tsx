import { Box, Text } from "@chakra-ui/react"
import { Equals } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import Select from "react-select"
import { IOption } from "../../../../../types/types"
import { GridHeader } from "../../../../shared/grid/grid-header"
import { SearchGrid } from "../../../../shared/grid/search-grid"
import { SearchGridItem } from "../../../../shared/grid/search-grid-item"

interface IProps {
  mappableExternalOptions: IOption[]
  setOptionMapValue: (externalOptionValue: string | null, requirementOption) => void
  availableRequirementOptions: IOption[]
  optionValueToRequirementOption: Record<string, IOption>
  currentOptionsMap: Record<string, string> | null
}

const gridHeaderProps = {
  borderWidth: 0,
  borderColor: "border.light",
  borderTop: "none",
  borderBottom: "none",
  px: 4,
}

export const OptionsMapGrid = observer(function OptionsMapGrid({
  mappableExternalOptions,
  setOptionMapValue,
  availableRequirementOptions,
  optionValueToRequirementOption,
  currentOptionsMap,
}: IProps) {
  const { t } = useTranslation()
  return (
    <Box as={"section"}>
      <Text color={"text.primary"} fontWeight={"bold"} fontSize={"md"}>
        {t("requirementsLibrary.modals.computedComplianceSetup.optionsMapGrid.title")}
      </Text>
      <Box px={4}>
        <SearchGrid
          mt={2}
          gridRowClassName={"compliance-mapper-grid-row"}
          templateColumns={"1fr 55px 1fr"}
          sx={{
            "[role='columnheader'], [role='cell']": {
              justifyContent: "center",
              display: "flex",
            },
          }}
        >
          <Box display={"contents"} role={"row"} className={"compliance-mapper-grid-row"}>
            <GridHeader {...gridHeaderProps}>
              {t("requirementsLibrary.modals.computedComplianceSetup.optionsMapGrid.externalOption")}
            </GridHeader>
            <GridHeader {...gridHeaderProps} />
            <GridHeader {...gridHeaderProps} borderRight={"none"}>
              {t("requirementsLibrary.modals.computedComplianceSetup.optionsMapGrid.requirementOption")}
            </GridHeader>
          </Box>
          {mappableExternalOptions.map((mappableExternalOption) => {
            const requirementOption =
              optionValueToRequirementOption[currentOptionsMap?.[mappableExternalOption.value]] ?? null
            return (
              <Box
                key={mappableExternalOption.value}
                display={"contents"}
                role={"row"}
                className={"compliance-mapper-grid-row"}
              >
                <SearchGridItem>{mappableExternalOption.label}</SearchGridItem>
                <SearchGridItem>
                  <Equals />
                </SearchGridItem>
                <SearchGridItem>
                  <Box w={"full"}>
                    <Select
                      isClearable
                      menuPosition={"fixed"}
                      options={availableRequirementOptions}
                      value={requirementOption}
                      onChange={(option) => setOptionMapValue(mappableExternalOption.value, option)}
                    />
                  </Box>
                </SearchGridItem>
              </Box>
            )
          })}
        </SearchGrid>
      </Box>
    </Box>
  )
})
