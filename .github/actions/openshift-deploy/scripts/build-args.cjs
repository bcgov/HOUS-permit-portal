module.exports = ({ variablesJson = "{}", releaseVersionPrefix = "", sha }) => {
  let variables
  try {
    variables = JSON.parse(variablesJson)
  } catch {
    throw new Error("GitHub configuration must be valid JSON")
  }
  if (!variables || Array.isArray(variables) || typeof variables !== "object") {
    throw new Error("Frontend configuration must be a JSON object")
  }

  const frontend = {}
  for (const [name, value] of Object.entries(variables)) {
    if (name.startsWith("VITE_")) frontend[name] = value
  }

  if (releaseVersionPrefix) frontend.VITE_RELEASE_VERSION = `${releaseVersionPrefix}-${sha}`

  const sorted = Object.fromEntries(Object.entries(frontend).sort(([a], [b]) => a.localeCompare(b)))
  return `FRONTEND_BUILD_ENV_JSON=${JSON.stringify(sorted)}`
}
