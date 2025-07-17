import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { IJurisdiction } from "../../../models/jurisdiction"
import { useMst } from "../../../setup/root"
import { IOption } from "../../../types/types"
import { StepCodeLookupAddressSelect } from "../select/selectors/step-code-lookup-address-select"

interface IStepCodeAddressSearchForm {
  address: IOption
}

interface IStepCodeAddressSearchProps {
  onJurisdictionFound?: (jurisdiction: IJurisdiction | null) => void
}

const StepCodeAddressSearch = observer(({ onJurisdictionFound }: IStepCodeAddressSearchProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [selectedSite, setSelectedSite] = useState<number | null>(null)
  const [searchKey, setSearchKey] = useState(0)
  const isHomePage = location.pathname === "/welcome" ? true : false
  const { geocoderStore, jurisdictionStore } = useMst()
  const { setCurrentJurisdiction } = jurisdictionStore
  const methods = useForm<IStepCodeAddressSearchForm>({
    defaultValues: {
      address: null,
    },
  })
  const { control } = methods

  const handleCheckAddress = async () => {
    if (!selectedSite) {
      onJurisdictionFound?.(null)
      return
    }

    const jurisdiction = await geocoderStore.fetchGeocodedJurisdiction(String(selectedSite))

    if (!jurisdiction) {
      onJurisdictionFound?.(null)
      return
    }

    setCurrentJurisdiction(jurisdiction.id)

    if (isHomePage) {
      onJurisdictionFound?.(jurisdiction)
      setSearchKey((k) => k + 1)
      setSelectedSite(null)
    } else {
      navigate(`/jurisdictions/${jurisdiction.slug}/step-code-requirements`)
    }
  }

  return (
    <FormProvider {...methods}>
      <Controller
        key={searchKey}
        name="address"
        control={control}
        render={({ field }) => (
          <StepCodeLookupAddressSelect
            value={field.value}
            onChange={(option) => {
              field.onChange(option)
              setSelectedSite(option?.value as number)
            }}
            onButtonClick={handleCheckAddress}
            isButtonDisabled={!selectedSite}
            buttonText={t("home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.checkAddress")}
          />
        )}
      />
    </FormProvider>
  )
})

export default StepCodeAddressSearch
