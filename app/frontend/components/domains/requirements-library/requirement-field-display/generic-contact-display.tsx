import { Box, BoxProps, FormControl, FormLabel, Heading, HeadingProps, Switch } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { getRequirementTypeLabel } from "../../../../constants"
import { ERequirementContactFieldItemType } from "../../../../types/enums"
import { ContactFieldItemDisplay } from "./contact-field-item-display"
import { TRequirementFieldDisplayProps } from "./index"

export type TGenericContactDisplayProps = {
  contactFieldItems: Array<{
    type: ERequirementContactFieldItemType
    containerProps?: BoxProps
  }>
  containerProps?: BoxProps
  renderHeading?: () => JSX.Element
} & TRequirementFieldDisplayProps

export function GenericContactDisplay({
  contactFieldItems,
  label,
  labelProps,
  showAddLabelIndicator,
  requirementType,
  containerProps,
  renderHeading,
  addMultipleContactProps,
}: TGenericContactDisplayProps) {
  const { t } = useTranslation()
  return (
    <>
      <Box
        w={"full"}
        as={"section"}
        borderRadius={"sm"}
        border={"1px solid"}
        borderColor={"border.light"}
        borderBottomRadius={addMultipleContactProps?.shouldRender ? "none" : undefined}
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

      {addMultipleContactProps?.shouldRender && (
        <FormControl
          bg={"greys.grey04"}
          border={"1px solid"}
          borderColor={"border.light"}
          borderBottomRadius={"sm"}
          borderTop={"none"}
          w={"full"}
          px={4}
          py={3}
          display="flex"
          alignItems="center"
          justifyContent={"space-between"}
          {...addMultipleContactProps?.formControlProps}
        >
          <FormLabel htmlFor="can-add-label" mb="0">
            {t("requirementsLibrary.modals.canAddMultipleContacts")}
          </FormLabel>
          <Switch
            id="can-add-label"
            sx={{
              ".chakra-switch__track[aria-checked=true], .chakra-switch__track[data-checked]": {
                "--switch-bg": "var(--chakra-colors-success)",
              },
            }}
            {...addMultipleContactProps?.switchProps}
          />
        </FormControl>
      )}
    </>
  )
}
