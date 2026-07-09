# Step Code Contracts

This document records the Step Code contracts that the staged-checklist refactor preserves while moving toward one StepCode report family with staged checklist envelopes.

## StepCode Creation

- Part 3 creation accepts `stepCode.preConstructionChecklistAttributes.sectionCompletionStatus` from the frontend and `step_code.pre_construction_checklist_attributes.section_completion_status` on the Rails side. The backend still accepts legacy `checklist_attributes` during the transition.
- Part 9 creation accepts `stepCode.preConstructionChecklistAttributes` from the frontend and `step_code.pre_construction_checklist_attributes` on the Rails side.
- Both creation flows may be standalone or permit-linked. Permit-linked creation finds or creates one kept StepCode report family for the permit.
- During the transition, new StepCodes default to `current_stage: pre_construction`.

## Checklist Updates

- Part 3 checklist updates keep the existing request root: `checklist`.
- Part 9 checklist updates keep the existing request root: `stepCodeChecklist`.
- Checklist `stage` is lifecycle identity and is not normal editable form data.
- Stage-specific create/update payloads may diverge as Mid-Construction and As-Built forms become real workflows.

## Section Completion Status

- Section completion status remains a JSON object keyed by section name.
- Each section value is permitted as `{ complete, relevant }`.
- Part 3 and Part 9 section key sets are intentionally separate domain schemas.

## Report Generation

- Existing callers may enqueue report generation with only a StepCode id.
- New staged callers may pass an explicit checklist id or stage so PDFs render the intended lifecycle checklist.
- If no explicit checklist is passed, report generation uses `current_checklist`, which resolves from `StepCode.current_stage`.

## Serialization

- Part 3 continues to serialize a singular `checklist` for compatibility, while moving toward a staged `checklists` collection.
- Part 9 continues to serialize `checklists`.
- StepCode serialization includes stage selection metadata so clients can resolve the active checklist without hard-coding pre-construction.
