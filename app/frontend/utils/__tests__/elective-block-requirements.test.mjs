import assert from "node:assert/strict"
import { test } from "node:test"
import { applyEnabledElectiveRequirements } from "../elective-block-requirements.ts"

const confirmation = () => ({
  id: "block-confirmation",
  type: "checkbox",
  customClass: "optional-block-confirmation-checkbox",
  validate: { required: true },
})

const elective = (id, { validate } = {}) => ({
  id,
  elective: true,
  customConditional: ";show = false",
  ...(validate ? { validate } : {}),
})

test("a required enabled elective hides the acknowledgement and is actually required", () => {
  const notes = elective("notes")
  const reviewTypes = elective("review-types", { validate: { maxSelectedCount: 2 } })
  const components = applyEnabledElectiveRequirements(
    [notes, reviewTypes, confirmation()],
    ["notes", "review-types"],
    ["review-types"]
  )

  assert.equal(notes.validate.required, true)
  assert.equal(notes.customConditional, "")
  assert.equal(reviewTypes.validate.required, false)
  assert.equal(reviewTypes.validate.maxSelectedCount, 2)
  assert.equal(
    components.some((component) => component.customClass?.includes("optional-block-confirmation-checkbox")),
    false
  )
})

test("the acknowledgement stays when every enabled elective is optional", () => {
  const notes = elective("notes")
  const components = applyEnabledElectiveRequirements([notes, confirmation()], ["notes"], ["notes"])

  assert.equal(notes.validate.required, false)
  assert.equal(components.at(-1).id, "block-confirmation")
})
