export default [
  {
    type: "textfield",
    input: true,
    defaultValue: "features",
    key: "providerOptions.responseProperty",
    label: "Response Property",
    placeholder: "Enter Response Property",
    weight: 30,
    tooltip: "The property within the response data, where iterable addresses reside. For example: results.",
  },
  {
    type: "textfield",
    input: true,
    defaultValue: "properties.fullAddress",
    key: "providerOptions.displayValueProperty",
    label: "Display Value Property",
    placeholder: "Display Value Property",
    weight: 40,
    tooltip: "The property of each address in the response to use as the display value.",
  },
  {
    type: "textarea",
    input: true,
    key: "queryParameters",
    label: "Params",
    placeholder: "{ ... }",
    weight: 50,
    rows: 5,
    editor: "ace",
    as: "json",
    tooltip: "Additional query params can be specified here in a way of JSON object.",
  },
  {
    type: "textarea",
    input: true,
    key: "manualModeViewString",
    label: "Manual Mode View String",
    placeholder: "Enter Manual Mode View String",
    description:
      '"address" variable references component value, "data" - submission data and "component" - address component schema.',
    weight: 60,
    rows: 5,
    editor: "ace",
    tooltip:
      "Specify template which should be when quering view string for the component value entered in manual mode. This string is used in table view, CSV export and email rendering. When left blank combined value of all custom-formio-components joined with comma will be used.",
  },
]
