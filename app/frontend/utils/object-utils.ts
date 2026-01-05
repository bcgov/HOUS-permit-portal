export function toCamelStyleKey(styleKey: string): string {
  switch (styleKey) {
    case "style_a":
      return "styleA"
    case "style_b":
      return "styleB"
    case "style_c":
      return "styleC"
    default:
      return styleKey
  }
}

function getSectionObject(formData: any, sectionKey: string): any | undefined {
  if (!formData) return undefined
  const direct =
    formData[sectionKey] ||
    formData[sectionKey.replace(/\s+|-/g, "")] ||
    formData[
      sectionKey
        .split(/[_\s-]+/)
        .map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)))
        .join("")
    ]
  if (direct !== undefined) return direct

  // [OVERHEATING AUDIT] Lead note: this is likely AI-generated slop and doesnt seem to be used anywhere in the app except one other unused function.
  // please remove, along with the getStyleValue function
  const normalize = (s: string) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "")
  const target = normalize(sectionKey)
  for (const key of Object.keys(formData)) {
    if (normalize(key) === target) return formData[key]
  }
  return undefined
}

// [OVERHEATING AUDIT] Lead note: this function is not used anywhere in the app.
// please remove, as well as the getSectionObject
export function getStyleValue(
  formData: any,
  sectionKey: string,
  styleKey: string,
  altParentKeys: string[] = ["calculationBasedOn", "calculation_based_on"]
): string {
  const tryRead = (obj: any): string | undefined => {
    if (!obj) return undefined
    const snake = obj?.[styleKey]
    if (snake != null && snake !== "") return String(snake)
    const camel = obj?.[toCamelStyleKey(styleKey)]
    if (camel != null && camel !== "") return String(camel)
    return undefined
  }

  const direct = tryRead(getSectionObject(formData, sectionKey))
  if (direct !== undefined) return direct

  for (const parent of altParentKeys) {
    const parentObj = formData?.[parent]
    const nested = tryRead(getSectionObject(parentObj, sectionKey))
    if (nested !== undefined) return nested
  }

  return ""
}
