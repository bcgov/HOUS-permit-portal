/* tslint:disable */
import { Components } from "formiojs"
import { Constants } from "../Common/Constants.js"
import editForm from "./Component.form.js"
const ParentComponent = Components.components.address
const ID = "simpleaddressadvanced"
const DISPLAY = "Address"
export default class Component extends ParentComponent {
  static schema(...extend) {
    return ParentComponent.schema(
      {
        type: ID,
        label: DISPLAY,
        key: ID,
      },
      ...extend
    )
  }
  static editForm = editForm
  static get builderInfo() {
    return {
      title: DISPLAY,
      group: "advanced",
      icon: "home",
      weight: 770,
      documentation: Constants.DEFAULT_HELP_LINK,
      schema: Component.schema(),
    }
  }

  /**
   * Normalize camelCase keys from backend to snake_case expected by the component.
   * Handles the nested address object as well.
   * @param {object} value - The value object for this component.
   * @returns {object} - The normalized value object.
   */
  normalizeValueKeys(value) {
    if (!value || typeof value !== "object") {
      return value
    }

    const keyMap = {
      placeId: "place_id",
      osmType: "osm_type",
      osmId: "osm_id",
      displayName: "display_name",
      placeRank: "place_rank",
      // Note: addresstype seems to remain snake_case in your example
    }

    const addressKeyMap = {
      houseNumber: "house_number",
      countryCode: "country_code",
      iSO31662Lvl4: "ISO3166-2-lvl4", // Be careful with this specific capitalization if issues persist
    }

    const normalized = {}
    for (const key in value) {
      const newKey = keyMap[key] || key
      if (key === "address" && typeof value.address === "object") {
        normalized[newKey] = {}
        for (const addrKey in value.address) {
          const newAddrKey = addressKeyMap[addrKey] || addrKey
          normalized[newKey][newAddrKey] = value.address[addrKey]
        }
      } else {
        normalized[newKey] = value[key]
      }
    }

    // Ensure essential snake_case keys exist if their camelCase counterpart was missing
    for (const camelKey in keyMap) {
      const snakeKey = keyMap[camelKey]
      if (!normalized.hasOwnProperty(snakeKey) && normalized.hasOwnProperty(camelKey)) {
        normalized[snakeKey] = normalized[camelKey]
        // delete normalized[camelKey]; // Optional: remove original camelCase key
      }
    }

    if (normalized.address) {
      for (const camelAddrKey in addressKeyMap) {
        const snakeAddrKey = addressKeyMap[camelAddrKey]
        if (!normalized.address.hasOwnProperty(snakeAddrKey) && normalized.address.hasOwnProperty(camelAddrKey)) {
          normalized.address[snakeAddrKey] = normalized.address[camelAddrKey]
          // delete normalized.address[camelAddrKey]; // Optional: remove original camelCase key
        }
      }
    }

    return normalized
  }

  /**
   * Overrides the parent setValue method to handle potential camelCase keys
   * coming from the backend after form submission and reload.
   * @param {*} value - The value to set on the component.
   * @param {object} flags - Flags passed during the value setting process.
   */
  setValue(value, flags = {}) {
    const normalizedValue = this.normalizeValueKeys(value)
    // Preserve mode if it exists in the original value (might be set by Nominatim provider)
    if (value && value.mode) {
      normalizedValue.mode = value.mode
    }
    return super.setValue(normalizedValue, flags)
  }
}
