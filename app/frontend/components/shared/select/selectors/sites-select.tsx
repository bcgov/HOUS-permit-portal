import { Button, Input as ChakraInput, Flex, FormControl, FormLabel, HStack, InputGroup, Text } from "@chakra-ui/react"
import { MapPin } from "@phosphor-icons/react"
import debounce from "lodash/debounce"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { ControlProps, InputProps, OptionProps, components } from "react-select"
import CreatableSelect from "react-select/creatable"
import { IJurisdiction } from "../../../../models/jurisdiction"
import { useMst } from "../../../../setup/root"
import { IOption } from "../../../../types/types"
import { formatPidLabel, formatPidValue } from "../../../../utils/utility-functions"
import { AsyncSelect, TAsyncSelectProps } from "../async-select"
import { JurisdictionSelect } from "./jurisdiction-select"

export type TSitesSelectProps = {
  onChange: (option: IOption) => void
  selectedOption: IOption
  pidName?: string
  siteName?: string
  pidRequired?: boolean
  jurisdictionIdFieldName?: string
  showManualModeToggle?: boolean
  defaultManualMode?: boolean
  onLtsaMatcherFound?: (matcher: string | null) => void
  showJurisdiction?: boolean
  initialJurisdiction?: IJurisdiction | null
  isDisabled?: boolean
} & Partial<TAsyncSelectProps>

// Please be advised that this is expected to be used within a form context!
// This component now includes integrated jurisdiction matching and manual mode functionality

export const SitesSelect = observer(function ({
  onChange,
  selectedOption,
  stylesToMerge,
  pidName = "pid",
  siteName = "site",
  pidRequired = false,
  jurisdictionIdFieldName = "jurisdictionId",
  showManualModeToggle = true,
  defaultManualMode = false,
  onLtsaMatcherFound,
  showJurisdiction = true,
  initialJurisdiction = null,
  isDisabled = false,
  ...rest
}: TSitesSelectProps) {
  const { t } = useTranslation()
  const { geocoderStore, jurisdictionStore } = useMst()
  const [pidOptions, setPidOptions] = useState<IOption<string>[]>([])
  const [jurisdiction, setJurisdiction] = useState<IJurisdiction | null>(initialJurisdiction)
  const [manualMode, setManualMode] = useState(defaultManualMode)
  const {
    fetchSiteOptions: fetchOptions,
    fetchPids,
    fetchSiteDetailsFromPid,
    fetchGeocodedJurisdiction,
  } = geocoderStore
  const { addJurisdiction, getJurisdictionById } = jurisdictionStore
  const pidSelectRef = useRef(null)

  const { setValue, control, watch } = useFormContext()

  const pidWatch = watch(pidName)
  const siteWatch = watch(siteName)

  // Sync jurisdiction state when initialJurisdiction prop changes
  useEffect(() => {
    // Only update if initialJurisdiction is provided and different from current jurisdiction
    // Skip if manual mode is enabled (user is manually selecting)
    if (manualMode) {
      return
    }
    if (initialJurisdiction) {
      // Compare by ID to handle MobX observable reference changes
      const currentJurisdictionId = jurisdiction?.id
      const initialJurisdictionId = initialJurisdiction.id
      if (currentJurisdictionId !== initialJurisdictionId) {
        setJurisdiction(initialJurisdiction)
        setValue(jurisdictionIdFieldName, initialJurisdictionId)
      }
    }
  }, [initialJurisdiction?.id, jurisdiction?.id, manualMode, jurisdictionIdFieldName, setValue])

  const fetchSiteOptions = (address: string, callback: (options) => void) => {
    if (address.length > 3) {
      fetchOptions(address).then((options: IOption[]) => {
        setValue(pidName, null)
        setValue(siteName, null)
        callback(options)
      })
    } else callback([])
  }

  const handleChange = (option: IOption) => {
    setPidOptions([])
    onChange(option)
    setValue(pidName, null)
    if (option) {
      //set the label for the address?
      fetchPids(option.value).then((pids: string[]) => {
        if (pids) {
          setPidOptions(pids.map((pid) => ({ value: pid, label: formatPidLabel(pid) })))
          const selectControl = pidSelectRef?.current?.controlRef
          if (selectControl && !R.isEmpty(pids)) {
            selectControl.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))
          }
        }
      })
    }
  }

  useEffect(() => {
    ;(async () => {
      if (R.isNil(siteWatch?.value) && pidWatch) {
        //the pid is valid, lets try to fill in the address based on the PID
        const siteDetails = await fetchSiteDetailsFromPid(pidWatch)
        if (siteDetails) {
          setValue(siteName, siteDetails)
        }
      }
    })()
  }, [siteWatch?.value, pidWatch])

  // Jurisdiction matching logic - integrated from useJurisdictionFromSite hook
  useEffect(() => {
    if (manualMode) {
      return
    }
    const siteValue: string | undefined = siteWatch?.value
    if (R.isNil(siteValue) || siteValue === "") {
      // Don't clear jurisdiction if we have an initialJurisdiction and haven't selected a site yet
      // Only clear if we don't have an initialJurisdiction, or if the current jurisdiction is different from initial
      if (!initialJurisdiction) {
        setJurisdiction(null)
        setValue(jurisdictionIdFieldName, null)
      } else {
        // Compare by ID to handle MobX observable reference changes
        const currentJurisdictionId = jurisdiction?.id
        const initialJurisdictionId = initialJurisdiction.id
        if (currentJurisdictionId !== initialJurisdictionId) {
          // If we have an initialJurisdiction but current jurisdiction differs, restore initial
          setJurisdiction(initialJurisdiction)
          setValue(jurisdictionIdFieldName, initialJurisdictionId)
        }
      }
      return
    }

    let isActive = true
    ;(async () => {
      try {
        const response = await fetchGeocodedJurisdiction(siteValue, undefined, Boolean(onLtsaMatcherFound))
        const matchedJurisdiction = response?.jurisdiction
        const foundLtsaMatcher = response?.ltsaMatcher ?? null
        if (onLtsaMatcherFound) {
          onLtsaMatcherFound(foundLtsaMatcher)
        }
        if (!isActive) return
        if (matchedJurisdiction) {
          addJurisdiction(matchedJurisdiction)
          setValue(jurisdictionIdFieldName, matchedJurisdiction.id)
          setJurisdiction(matchedJurisdiction)
        } else {
          setValue(jurisdictionIdFieldName, null)
          setJurisdiction(null)
        }
      } catch (_e) {
        setValue(jurisdictionIdFieldName, null)
        setJurisdiction(null)
        if (onLtsaMatcherFound) {
          onLtsaMatcherFound(null)
        }
      }
    })()

    return () => {
      isActive = false
    }
  }, [siteWatch?.value, manualMode, initialJurisdiction?.id, jurisdictionIdFieldName, setValue, onLtsaMatcherFound])

  const debouncedFetchOptions = useCallback(debounce(fetchSiteOptions, 1000), [])

  return (
    <Flex direction="column" gap={4} w="full">
      {/* Address and PID - Always visible */}
      <Flex direction={{ base: "column", md: "row" }} bg="greys.grey03" px={6} py={2} gap={4} w="full">
        <FormControl>
          <FormLabel>{t("permitApplication.addressLabel")}</FormLabel>
          <InputGroup>
            <AsyncSelect<IOption, boolean>
              isClearable={true}
              onChange={handleChange}
              placeholder="Search Addresses"
              value={selectedOption}
              menuPosition="fixed"
              menuShouldScrollIntoView={false}
              isDisabled={isDisabled}
              components={{
                Control,
                Option,
                Input,
              }}
              // Ensure full-width container and menu portal z-index by default
              styles={{
                container: (css) => ({
                  ...css,
                  width: "100%",
                }),
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                ...(rest.styles as any),
              }}
              stylesToMerge={{
                control: {
                  borderRadius: "4px",
                  paddingInline: "0.75rem",
                  height: "40px",
                },
                menu: {
                  width: "100%",
                  background: "var(--chakra-colors-greys-grey10)",
                },
                ...stylesToMerge,
              }}
              defaultOptions
              loadOptions={debouncedFetchOptions}
              closeMenuOnSelect={true}
              isCreatable={false}
              // Render menu in a portal by default to avoid clipping in overflow contexts
              menuPortalTarget={
                (rest as any).menuPortalTarget ?? (typeof document !== "undefined" ? document.body : undefined)
              }
              {...rest}
            />
          </InputGroup>
        </FormControl>

        <FormControl>
          <FormLabel>{t("permitApplication.pidLabel")}</FormLabel>
          <InputGroup>
            <Flex w="full" direction="column">
              <Controller
                name={pidName}
                control={control}
                rules={{
                  required:
                    (pidRequired || pidOptions.length > 0) && !initialJurisdiction
                      ? String(t("ui.isRequired", { field: t("permitApplication.pidLabel") }))
                      : false,
                }}
                render={({ field: { onChange, value } }) => {
                  return (
                    <CreatableSelect
                      // @ts-ignore
                      options={pidOptions}
                      ref={pidSelectRef}
                      value={{
                        label: formatPidLabel(value),
                        value: formatPidValue(value),
                      }}
                      onChange={(option) => {
                        if (!option) {
                          setValue(siteName, null)
                        }
                        onChange(formatPidValue(option?.value))
                      }}
                      onCreateOption={(inputValue: string) => {
                        const newValue = { label: formatPidLabel(inputValue), value: formatPidValue(inputValue) }
                        onChange(newValue.value)
                      }}
                      formatCreateLabel={(inputValue: string) =>
                        t("permitApplication.usePid", { inputValue: formatPidLabel(inputValue) })
                      }
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 10000 }),
                        menu: (base) => ({ ...base, zIndex: 10000 }),
                        /* keep existing styles */
                      }}
                      isClearable
                      isSearchable
                      isDisabled={isDisabled}
                    />
                  )
                }}
              />
            </Flex>
          </InputGroup>
        </FormControl>
      </Flex>

      {/* Auto-matched Jurisdiction Display - Only in automatic mode */}
      {!manualMode && showJurisdiction && (
        <Flex bg="greys.grey03" px={6} py={2} gap={2} w="full" direction="column">
          <FormLabel mb={0}>{t("permitProject.new.jurisdictionTitle")}</FormLabel>
          <ChakraInput isDisabled value={jurisdiction?.qualifiedName || ""} />
        </Flex>
      )}

      {/* Manual Jurisdiction Selector - Only in manual mode */}
      {manualMode && showJurisdiction && (
        <Flex bg="greys.grey03" px={6} py={2} gap={4} w="full" direction="column">
          <FormControl w="full" zIndex={1}>
            <FormLabel>{t("permitProject.new.jurisdictionTitle")}</FormLabel>
            <InputGroup w="full">
              <Controller
                name={jurisdictionIdFieldName}
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <JurisdictionSelect
                      onChange={(selectValue) => {
                        if (selectValue) addJurisdiction(selectValue)
                        onChange(selectValue?.id)
                      }}
                      onFetch={() => setValue(jurisdictionIdFieldName, null)}
                      selectedOption={value ? { label: getJurisdictionById(value)?.reverseQualifiedName, value } : null}
                      menuPortalTarget={document.body}
                      isDisabled={isDisabled}
                    />
                  )
                }}
              />
            </InputGroup>
          </FormControl>
        </Flex>
      )}

      {/* Manual Mode Toggle */}
      {showManualModeToggle && showJurisdiction && (
        <Button isDisabled={isDisabled} variant="link" size="sm" onClick={() => setManualMode((prev) => !prev)}>
          {manualMode ? t("ui.switchToAutomaticMode") : t("ui.switchToManualMode")}
        </Button>
      )}
    </Flex>
  )
})

const Option = (props: OptionProps<IOption>) => {
  return (
    <components.Option {...props}>
      <HStack color={"text.secondary"} fontSize={"xs"}>
        <MapPin size={"12px"} style={{ marginRight: "0.5rem" }} />
        <Text>{props.label}</Text>
      </HStack>
    </components.Option>
  )
}

const Control = ({ children, ...props }: ControlProps<IOption>) => {
  return (
    <components.Control {...props}>
      <MapPin size={"16.7px"} />
      {children}
    </components.Control>
  )
}

const Input = ({ children, ...props }: InputProps) => {
  return (
    <components.Input {...props} aria-label="type here to search addresses">
      {children}
    </components.Input>
  )
}
