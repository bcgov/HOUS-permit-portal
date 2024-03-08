import { Box, BoxProps, Heading, HeadingProps } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { getRequirementTypeLabel } from "../../../../constants"
import { ERequirementContactFieldItemType } from "../../../../types/enums"
import { ContactFieldItemDisplay } from "./contact-field-item-display"
import { TRequirementFieldDisplayProps } from "./index"

export function GenericContactDisplay({
  contactFieldItems,
  label,
  labelProps,
  showAddLabelIndicator,
  requirementType,
  containerProps,
  renderHeading,
}: {
  contactFieldItems: Array<{
    type: ERequirementContactFieldItemType
    containerProps?: BoxProps
  }>
  containerProps?: BoxProps
  renderHeading?: () => JSX.Element
} & TRequirementFieldDisplayProps) {
  const { t } = useTranslation()
  return (
    <Box
      w={"full"}
      as={"section"}
      borderRadius={"sm"}
      border={"1px solid"}
      borderColor={"border.light"}
      px={4}
      py={3}
      {...containerProps}
    >
      {renderHeading ? (
        renderHeading()
      ) : (
        <Heading
          as={"h4"}
          fontSize={"md"}
          {...(labelProps as HeadingProps)}
          color={!label && showAddLabelIndicator ? "error" : "text.primary"}
        >
          {label ??
            (showAddLabelIndicator
              ? `${t("requirementsLibrary.modals.addLabel")} *`
              : getRequirementTypeLabel(requirementType))}
        </Heading>
      )}
      <Box w={"full"} display={"grid"} gridTemplateColumns={"repeat(2, calc(50% - 0.75rem))"} gap={"1rem 1.5rem"}>
        {contactFieldItems.map(({ type, containerProps }) => (
          <Box
            key={type}
            sx={{
              ".chakra-form-control": {
                display: "flex",
                flexDir: "column",
                justifyContent: "space-between",
                h: "100%",
              },
            }}
            {...containerProps}
          >
            <ContactFieldItemDisplay contactFieldItemType={type} />
          </Box>
        ))}
      </Box>
    </Box>
  )
}
