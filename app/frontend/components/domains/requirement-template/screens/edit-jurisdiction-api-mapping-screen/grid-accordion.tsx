import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Stack,
  Text,
  UseAccordionProps,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import pluck from "ramda/src/pluck"
import React, { useState } from "react"
import { ITemplateVersion } from "../../../../../models/template-version"
import { IRequirementsMapping } from "../../../../../types/types"
import { isStepCodePackageFileRequirementCode } from "../../../../../utils/utility-functions"
import { SearchGridItem } from "../../../../shared/grid/search-grid-item"
import { RequirementFieldDisplay } from "../../../requirements-library/requirement-field-display"

interface IProps {
  requirementBlockMapping: IRequirementsMapping[keyof IRequirementsMapping]
  templateVersion: ITemplateVersion
}

const searchGridItemProps = {
  borderY: "none",
  borderX: "none",
  borderRight: "1px solid",
  borderColor: "border.light",
  fontSize: "sm",
}
export const GridAccordion = observer(function GridAccordion({ requirementBlockMapping, templateVersion }: IProps) {
  const [expandedIndex, setExpandedIndex] = useState(0)
  const requirementBlockJson = templateVersion.getRequirementBlockJsonById(requirementBlockMapping.id)
  const isExpanded = expandedIndex === 0
  return (
    <Box display={"contents"}>
      <Accordion
        sx={{
          "& .chakra-collapse": {
            display: `${isExpanded ? "contents" : "none"} !important`, // this is needed for the data grid layout to work
          },
        }}
        display={"contents"}
        index={expandedIndex}
        defaultIndex={0}
        onChange={setExpandedIndex as UseAccordionProps["onChange"]}
        allowToggle
      >
        <AccordionItem display={"contents"}>
          <Text
            as={"h3"}
            style={{
              gridColumn: "1/-1",
            }}
          >
            <AccordionButton
              _expanded={{
                bg: "greys.grey04",
              }}
            >
              <Box flex="1" textAlign="left">
                {requirementBlockJson?.name}{" "}
                <Text as={"span"} fontWeight={700} fontSize={"sm"}>
                  requirement block code: {requirementBlockJson?.sku}
                </Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </Text>
          <AccordionPanel pb={4} bg={"red"} sx={{ display: "contents" }}>
            {(requirementBlockJson.requirements ?? []).map((requirementJson) => {
              return (
                <Box key={requirementJson.id} role={"row"} display={"contents"}>
                  <SearchGridItem fontWeight={700} {...searchGridItemProps}>
                    {requirementBlockMapping?.requirements?.[requirementJson.requirementCode]?.localSystemMapping}
                  </SearchGridItem>
                  <SearchGridItem fontWeight={700} {...searchGridItemProps}>
                    {requirementJson.requirementCode}
                  </SearchGridItem>
                  <SearchGridItem {...searchGridItemProps} justifyContent={"flex-start"} alignItems={"flex-start"}>
                    <Stack color={"text.secondary"}>
                      <RequirementFieldDisplay
                        matchesStepCodePackageRequirementCode={isStepCodePackageFileRequirementCode(
                          requirementJson.requirementCode
                        )}
                        requirementType={requirementJson.inputType}
                        label={requirementJson.label}
                        helperText={requirementJson.hint}
                        unit={requirementJson?.inputOptions?.numberUnit}
                        options={pluck("label", requirementJson.inputOptions?.valueOptions ?? [])}
                        selectProps={{
                          maxW: "339px",
                        }}
                        addMultipleContactProps={{
                          shouldRender: true,
                          formControlProps: { isDisabled: true },
                          switchProps: {
                            isChecked: requirementJson?.inputOptions?.canAddMultipleContacts,
                          },
                        }}
                        required={requirementJson?.required}
                      />
                    </Stack>
                  </SearchGridItem>
                </Box>
              )
            })}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  )
})
