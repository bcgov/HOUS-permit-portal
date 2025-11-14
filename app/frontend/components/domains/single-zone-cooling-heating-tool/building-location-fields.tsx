import {
  Box,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  GridProps,
  Heading,
  Input,
  Text,
} from "@chakra-ui/react"
import debounce from "lodash/debounce"
import { observer } from "mobx-react-lite"
import React, { useCallback } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { IOption } from "../../../types/types"
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
        .catch(() => {
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
    styles: {
      menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
      menu: (base: any) => ({ ...base, zIndex: 9999 }),
    } as any,
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
  const { t } = useTranslation() as any
  const prefix = "singleZoneCoolingHeatingTool"
  const { setValue, clearErrors, register, formState } = useFormContext()
  const { errors } = formState as any

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
    setValue(field("postalCode"), addressData.postalCode, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
  }

  return (
    <Box>
      <Box display="flex" gap={10} mb={6}>
        <Box width="80%">
          <FormControl isInvalid={!!errors?.drawingIssueFor}>
            <FormLabel htmlFor="drawingIssueFor" mt={0}>
              {drawingIssueForLabel}
            </FormLabel>
            <Input
              id="drawingIssueFor"
              maxLength={105}
              {...(register as any)("drawingIssueFor", {
                required: t("ui.isRequired", { field: drawingIssueForLabel }) as string,
              })}
            />
            <FormErrorMessage>{(errors as any)?.drawingIssueFor?.message as any}</FormErrorMessage>
          </FormControl>
          <Text as="p" mb={2}>
            {drawingIssueForHelpText}
          </Text>
          <FormControl isInvalid={!!(errors as any)?.projectNumber}>
            <FormLabel htmlFor="projectNumber" mt={0}>
              {projectNumberLabel}
            </FormLabel>
            <Input
              id="projectNumber"
              width="20%"
              maxLength={15}
              {...(register as any)("projectNumber", {
                required: t("ui.isRequired", { field: projectNumberLabel }) as string,
              })}
            />
            <FormErrorMessage>{(errors as any)?.projectNumber?.message as any}</FormErrorMessage>
          </FormControl>
        </Box>
      </Box>
      <Divider my={10} />
      <Box mb={6}>
        <Heading as="h2" size="lg" mb={6} variant="yellowline">
          {titleLabel}
        </Heading>
      </Box>
      <Grid templateColumns={{ base: "1fr", md: "1fr" }} gap={6} {...gridProps}>
        <FormControl isInvalid={!!(errors as any)?.[namePrefix]?.model}>
          <FormLabel htmlFor={field("model")}>{label("model")}</FormLabel>
          <Input
            id={field("model")}
            width="50%"
            maxLength={60}
            {...(register as any)(field("model"), {
              required: t("ui.isRequired", { field: label("model") }) as string,
            })}
          />
          <FormErrorMessage>{(errors as any)?.[namePrefix]?.model?.message as any}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!(errors as any)?.[namePrefix]?.site}>
          <FormLabel htmlFor={field("site")}>{label("site")}</FormLabel>
          <Input
            id={field("site")}
            width="50%"
            maxLength={60}
            {...(register as any)(field("site"), {
              required: t("ui.isRequired", { field: label("site") }) as string,
            })}
          />
          <FormErrorMessage>{(errors as any)?.[namePrefix]?.site?.message as any}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!(errors as any)?.[namePrefix]?.lot}>
          <FormLabel htmlFor={field("lot")}>{label("lot")}</FormLabel>
          <Input
            id={field("lot")}
            maxLength={60}
            width="50%"
            {...(register as any)(field("lot"), {
              required: t("ui.isRequired", { field: label("lot") }) as string,
            })}
          />
          <FormErrorMessage>{(errors as any)?.[namePrefix]?.lot?.message as any}</FormErrorMessage>
        </FormControl>
        <Box position="relative" width="50%">
          <FormLabel htmlFor={field("address")}>{label("address")}</FormLabel>
          <AddressSearchSelect onAddressSelect={handleAddressSelect} />
        </Box>

        <FormControl isInvalid={!!(errors as any)?.[namePrefix]?.city}>
          <FormLabel htmlFor={field("city")}>{label("city")}</FormLabel>
          <Input
            id={field("city")}
            maxLength={60}
            width="50%"
            {...(register as any)(field("city"), {
              required: t("ui.isRequired", { field: label("city") }) as string,
            })}
          />
          <FormErrorMessage>{(errors as any)?.[namePrefix]?.city?.message as any}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!(errors as any)?.[namePrefix]?.province}>
          <FormLabel htmlFor={field("province")}>{label("province")}</FormLabel>
          <Input
            id={field("province")}
            maxLength={60}
            width="50%"
            {...(register as any)(field("province"), {
              required: t("ui.isRequired", { field: label("province") }) as string,
            })}
          />
          <FormErrorMessage>{(errors as any)?.[namePrefix]?.province?.message as any}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!(errors as any)?.[namePrefix]?.postalCode}>
          <FormLabel htmlFor={field("postalCode")}>{label("postalCode")}</FormLabel>
          <Input
            id={field("postalCode")}
            maxLength={60}
            width="50%"
            {...(register as any)(field("postalCode"), {
              required: t("ui.isRequired", { field: label("postalCode") }) as string,
              onChange: (e: any) => {
                // RHF will still receive the change event, then we clear any existing errors
                clearErrors(field("postalCode"))
              },
            })}
            onChange={(e) => {
              ;((register as any)(field("postalCode")) as any)?.onChange?.(e)
              clearErrors(field("postalCode"))
            }}
          />
          <FormErrorMessage>{(errors as any)?.[namePrefix]?.postalCode?.message as any}</FormErrorMessage>
        </FormControl>
      </Grid>
    </Box>
  )
}
