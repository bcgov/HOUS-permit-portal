import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  ListItem,
  Text,
  UnorderedList,
  useDisclosure,
  useTheme,
} from "@chakra-ui/react"
import React, { useRef, useState } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import Select, { components } from "react-select"
import { EVisibility } from "../../../types/enums"

// BlockVisibility Option component
export const BlockVisibilityOption = (props) => {
  const { data, isDisabled } = props
  return (
    <components.Option {...props} isDisabled={isDisabled}>
      <Box opacity={isDisabled ? 0.5 : 1} cursor={isDisabled ? "not-allowed" : "pointer"}>
        <Text color="text.link" fontWeight="bold" mb={1}>
          {data.label}
        </Text>
        <Text fontSize="sm">{data.description}</Text>
      </Box>
    </components.Option>
  )
}
// BlockVisibility SingleValue component
const BlockVisibilitySingleValue = (props) => {
  const { data } = props
  return (
    <components.SingleValue {...props}>
      <Text>{data.label}</Text>
    </components.SingleValue>
  )
}

// Function to integrate Chakra UI theme with react-select
const chakraStyles = (theme) => ({
  container: (provided, state) => ({
    ...provided,
    width: "100%",
    flexGrow: 1,
  }),
  control: (provided, state) => ({
    ...provided,
    backgroundColor: theme.colors.greys.white,
    boxShadow: state.isFocused ? `0 0 0 1px ${theme.colors.theme.blue}` : "none",
    minHeight: "40px",
    cursor: "pointer",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: theme.colors.greys.white,
    width: "300px",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? theme.colors.greys.grey03 : theme.colors.white,
    color: "black",
    cursor: "pointer",
    padding: theme.space[3],
  }),
  singleValue: (provided) => ({
    ...provided,
    display: "flex",
    flexDirection: "column",
  }),
})

interface IBlockVisibilitySelectProps {
  name: string
  forEarlyAccess?: boolean
}

export const BlockVisibilitySelect = ({ name, forEarlyAccess }: IBlockVisibilitySelectProps) => {
  const { control, setValue, watch } = useFormContext()
  const theme = useTheme()
  const { t } = useTranslation()
  const visibilityWatch = watch(name)

  // Define your options with title and description
  const options = [
    {
      value: EVisibility.any,
      label: t("requirementsLibrary.visibility.any"),
      description: t("requirementsLibrary.visibilityDescriptions.any"),
    },
    {
      value: EVisibility.live,
      label: t("requirementsLibrary.visibility.live"),
      description: t("requirementsLibrary.visibilityDescriptions.live"),
    },
    {
      value: EVisibility.earlyAccess,
      label: t("requirementsLibrary.visibility.earlyAccess"),
      description: t("requirementsLibrary.visibilityDescriptions.earlyAccess"),
      isDisabled: !forEarlyAccess,
    },
  ]

  const { isOpen, onOpen, onClose } = useDisclosure() // Modal state
  const [pendingOption, setPendingOption] = useState(null) // Pending option change

  const cancelRef = useRef()
  const selectRef = useRef()

  // Handle the option change
  const handleChange = (selectedOption) => {
    if (selectedOption.value === visibilityWatch) return

    // Show confirmation modal
    setPendingOption(selectedOption)
    onOpen()
    // This fixes some weird interference behaviour where the menu cant open again
    // after closing the alert dialog
    // @ts-ignore
    if (selectRef.current) selectRef.current.blur()
  }

  // Confirm the option change
  const confirmChange = () => {
    setValue(name, pendingOption ? pendingOption.value : null) // Update form value
    onClose() // Close the modal
  }

  // Cancel the option change
  const cancelChange = () => {
    setPendingOption(null) // Reset pending option
    onClose() // Close the modal
  }

  const titleMap = {
    [EVisibility.earlyAccess]: t("requirementsLibrary.modals.changeVisibility.fromEarlyAccessTitle"),
    [EVisibility.live]: t("requirementsLibrary.modals.changeVisibility.fromLiveTitle"),
    [EVisibility.any]: t("requirementsLibrary.modals.changeVisibility.fromLiveTitle"),
  }

  return (
    <>
      <Controller
        name={name}
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <Select
            {...field}
            styles={chakraStyles(theme)}
            ref={selectRef}
            options={options}
            components={{
              Option: BlockVisibilityOption,
              SingleValue: BlockVisibilitySingleValue,
            }}
            value={options.find((option) => option.value === field.value) || null}
            onChange={(selectedOption) => handleChange(selectedOption)}
          />
        )}
      />
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={cancelChange} size="2xl">
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {titleMap[visibilityWatch]}
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text>{t("requirementsLibrary.modals.changeVisibility.confirmChangeBody1")}</Text>
              <Text>{t("requirementsLibrary.modals.changeVisibility.confirmChangeBody2")}</Text>
              <br />
              <UnorderedList>
                <ListItem>
                  <Trans i18nKey="requirementsLibrary.modals.changeVisibility.listItem1" />
                </ListItem>
                <ListItem>
                  <Trans i18nKey="requirementsLibrary.modals.changeVisibility.listItem2" />
                </ListItem>
                <ListItem>
                  <Trans i18nKey="requirementsLibrary.modals.changeVisibility.listItem3" />
                </ListItem>
              </UnorderedList>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button variant="secondary" ref={cancelRef} onClick={cancelChange}>
                {t("ui.cancel")}
              </Button>
              <Button variant="primary" onClick={confirmChange} ml={3}>
                {t("ui.ok")}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}
