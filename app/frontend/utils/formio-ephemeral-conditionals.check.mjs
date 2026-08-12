// ponytail: assert-based self-check for processFieldsForEphemeral conditional preservation.
// Ceiling: duplicated logic — if processFieldsForEphemeral changes, update this file too.
// Run: node app/frontend/utils/formio-ephemeral-conditionals.check.mjs

import assert from "node:assert/strict"

/** Mirrors processFieldsForEphemeral: disable file/submit only; keep conditionals. */
const processFieldsForEphemeral = (formJson) => {
  formJson.components.forEach((section) => {
    section.components.forEach((block) => {
      block.components.forEach((requirement) => {
        if (["simplefile"].includes(requirement.type) || ["submit"].includes(requirement.key)) {
          requirement.disabled = true
        }
      })
    })
  })
  return formJson
}

const conditional = {
  show: false,
  conjunction: "all",
  conditions: [{ value: "duplex", operator: "isEqual", component: "section.block|category" }],
}

const formJson = {
  components: [
    {
      components: [
        {
          components: [
            { key: "block|part3_building_area", type: "number", conditional: { ...conditional } },
            { key: "block|upload", type: "simplefile", conditional: { show: true, when: "x", eq: "y" } },
            { key: "submit", type: "button" },
          ],
        },
      ],
    },
  ],
}

processFieldsForEphemeral(formJson)

const [area, file, submit] = formJson.components[0].components[0].components
assert.deepEqual(area.conditional, conditional, "field conditionals must survive ephemeral preview")
assert.equal(file.disabled, true, "simplefile disabled in ephemeral")
assert.deepEqual(file.conditional, { show: true, when: "x", eq: "y" }, "file conditional preserved")
assert.equal(submit.disabled, true, "submit disabled in ephemeral")

console.log("formio-ephemeral-conditionals.check.mjs: ok")
