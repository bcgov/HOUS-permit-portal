import { Box, BoxProps, Button, FormControl, FormLabel, Heading, HeadingProps, Switch } from "@chakra-ui/react"
import { Plus } from "@phosphor-icons/react"
import React from "react"
import { FieldValues } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { getRequirementTypeLabel } from "../../../../constants"
import { ERequirementContactFieldItemType } from "../../../../types/enums"
import { ContactFieldItemDisplay } from "./contact-field-item-display"
import { TRequirementFieldDisplayProps } from "./index"

export type TGenericContactDisplayProps<TFieldValues extends FieldValues> = {
  contactFieldItems: Array<{
    type: ERequirementContactFieldItemType
    containerProps?: BoxProps
  }>
  containerProps?: BoxProps
  renderHeading?: () => JSX.Element
} & TRequirementFieldDisplayProps

export function GenericContactDisplay<TFieldValues>({
  contactFieldItems,
  label,
  labelProps,
  showAddLabelIndicator,
  requirementType,
  containerProps,
  renderHeading,
  addMultipleContactProps,
  showAddButton,
  required,
}: TGenericContactDisplayProps<TFieldValues>) {
  const { t } = useTranslation()
  return (
    <Box>
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
              <ContactFieldItemDisplay required={required} contactFieldItemType={type} />
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

      {showAddButton && (
        <Button
          variant={"secondary"}
          leftIcon={<Plus />}
          size={"sm"}
          my={6}
          isDisabled
          // As it is a display component it should have the styles of
          // a normal button but should be disabled to screen readers and not clickable
          _disabled={{
            bg: "transparent",
            color: "text.primary",
            borderWidth: 1,
            borderColor: "border.dark",
            cursor: "not-allowed",
          }}
        >
          {t("requirementsLibrary.addAnotherPerson")}
        </Button>
      )}
    </Box>
  )
}
