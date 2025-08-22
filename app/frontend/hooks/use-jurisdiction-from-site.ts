import * as R from "ramda"
import { useEffect } from "react"
import { useMst } from "../setup/root"

interface IUseJurisdictionFromSiteOptions {
  siteFieldName?: string
  jurisdictionIdFieldName?: string
  disabled?: boolean
}

// Watches a RHF "site" field and populates the RHF "jurisdictionId" field using geocoder
export function useJurisdictionFromSite(
  watch: (name: string) => any,
  setValue: (name: string, value: any) => void,
  options: IUseJurisdictionFromSiteOptions = {}
) {
  const siteFieldName = options.siteFieldName ?? "site"
  const jurisdictionIdFieldName = options.jurisdictionIdFieldName ?? "jurisdictionId"
  const { geocoderStore, jurisdictionStore } = useMst()
  const { fetchGeocodedJurisdiction } = geocoderStore
  const { addJurisdiction } = jurisdictionStore

  const siteWatch = watch(siteFieldName)
  const isDisabled = options.disabled === true

  useEffect(() => {
    if (isDisabled) {
      return
    }
    const siteValue: string | undefined = siteWatch?.value
    if (R.isNil(siteValue) || siteValue === "") {
      // Do not overwrite an existing default jurisdictionId when no site is selected
      return
    }

    let isActive = true
    ;(async () => {
      try {
        const jurisdiction = await fetchGeocodedJurisdiction(siteValue, undefined)
        if (!isActive) return
        if (jurisdiction) {
          addJurisdiction(jurisdiction)
          setValue(jurisdictionIdFieldName, jurisdiction.id)
        } else {
          setValue(jurisdictionIdFieldName, null)
        }
      } catch (_e) {
        setValue(jurisdictionIdFieldName, null)
      }
    })()

    return () => {
      isActive = false
    }
  }, [siteWatch?.value, isDisabled])
}
