import { Box, Divider, FormLabel, Grid, GridProps, Heading, Text } from "@chakra-ui/react"
import debounce from "lodash/debounce"
import { observer } from "mobx-react-lite"
import React, { useCallback } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { IOption } from "../../../types/types"
import { TextFormControl } from "../../shared/form/input-form-control"
import { AsyncSelect } from "../../shared/select/async-select"

export interface BuildingLocationFieldsProps {
  namePrefix?: string
  i18nPrefix: string
  gridProps?: Partial<GridProps>
}

interface AddressSearchSelectProps {
  onAddressSelect: (addressData: { address: string; city: string; province: string; postalCode: string }) => void
  stylesToMerge?: any
}

const AddressSearchSelect = observer(function ({ onAddressSelect, stylesToMerge, ...rest }: AddressSearchSelectProps) {
  const { geocoderStore } = useMst()
  const { fetchSiteOptions: fetchOptions } = geocoderStore
  const { t } = useTranslation() as any

  const fetchAddressOptions = (inputValue: string, callback: (options: IOption[]) => void) => {
    if (inputValue.length > 3) {
      fetchOptions(inputValue)
        .then((response) => {
          callback(response || [])
        })
        .catch((error) => {
          callback([])
        })
    } else {
      callback([])
    }
  }

  const debouncedFetchAddressOptions: any = useCallback(debounce(fetchAddressOptions, 600), [])

  const handleAddressSelect = (option: IOption | null) => {
    if (!option) return

    const fullAddress = option.label || ""
    const parsedAddress = parseAddress(fullAddress)

    onAddressSelect(parsedAddress)
  }

  const props = {
    loadOptions: debouncedFetchAddressOptions,
    onChange: handleAddressSelect,
    placeholder: t("ui.enterAddress"),
    noOptionsMessage: () => "Type at least 4 characters to search",
    isClearable: true,
    isCreatable: false,
    defaultOptions: true,
    cacheOptions: true,
    menuPortalTarget: document.body,
    stylesToMerge: {
      menuPortal: (provided: any) => ({
        ...provided,
        zIndex: 9999,
      }),
    },
  }

  return (<AsyncSelect {...(props as any)} />) as any
})

const parseAddress = (fullAddress: string) => {
  const parts = fullAddress.split(",").map((part) => part.trim())

  let address = ""
  let city = ""
  let province = ""
  let postalCode = ""
  if (parts.length >= 4) {
    address = parts[0] || ""
    city = parts[1] || ""
    province = parts[2] || ""
    postalCode = parts[3] || ""
  } else if (parts.length >= 3) {
    address = parts[0] || ""
    city = parts[1] || ""
    province = parts[2] || ""
    postalCode = parts[3] || ""
  } else if (parts.length >= 2) {
    address = parts[0] || ""
    const secondPart = parts[1] || ""

    if (/^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i.test(secondPart.replace(/\s/g, ""))) {
      postalCode = secondPart
    } else {
      city = secondPart
    }
  } else {
    address = fullAddress
  }

  return {
    address: address,
    city: city,
    province: province,
    postalCode: postalCode,
  }
}

export const BuildingLocationFields: React.FC<BuildingLocationFieldsProps> = ({
  namePrefix = "buildingLocation",
  i18nPrefix,
  gridProps,
}) => {
  const { t } = useTranslation()
  const prefix = "singleZoneCoolingHeatingTool"
  const { setValue } = useFormContext()

  const field = (key: string) => `${namePrefix}.${key}`
  const label = (key: string): string => (t as any)(`${i18nPrefix}.${key}`) as string
  const titleLabel: string = String((t as any)(`${i18nPrefix}.title`))
  const drawingIssueForLabel: string = String((t as any)(`${prefix}.drawingIssueFor`))
  const drawingIssueForHelpText: string = String((t as any)(`${prefix}.drawingIssueForHelpText`))
  const projectNumberLabel: string = String((t as any)(`${prefix}.projectNumber`))

  const handleAddressSelect = (addressData: {
    address: string
    city: string
    province: string
    postalCode: string
  }) => {
    setValue(field("address"), addressData.address, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
    setValue(field("city"), addressData.city, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
    setValue(field("province"), addressData.province, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
  }

  return (
    <Box>
      <Box display="flex" gap={10} mb={6}>
        <Box width="80%">
          <TextFormControl fieldName="drawingIssueFor" maxLength={105} required label={drawingIssueForLabel} />
          <Text as="p" mb={2}>
            {drawingIssueForHelpText}
          </Text>
        </Box>
        <Box width="20%">
          <TextFormControl fieldName="projectNumber" maxLength={15} required label={projectNumberLabel} />
        </Box>
      </Box>
      <Divider my={10} />
      <Box mb={6}>
        <Heading as="h2" size="lg" mb={6} variant="yellowline">
          {titleLabel}
        </Heading>
      </Box>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} {...gridProps}>
        <TextFormControl fieldName={field("model")} required label={label("model")} maxLength={60} />
        <TextFormControl fieldName={field("site")} required label={label("site")} maxLength={60} />
        <TextFormControl fieldName={field("lot")} required label={label("lot")} maxLength={60} />
        <Box position="relative">
          <FormLabel fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
            {label("address")}
          </FormLabel>
          <AddressSearchSelect onAddressSelect={handleAddressSelect} />
        </Box>

        <TextFormControl fieldName={field("city")} required label={label("city")} maxLength={60} />
        <TextFormControl fieldName={field("province")} required label={label("province")} maxLength={60} />
        <TextFormControl fieldName={field("postalCode")} required label={label("postalCode")} maxLength={60} />
      </Grid>
    </Box>
  )
}
