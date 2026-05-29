class QuestionDefinition < ApplicationRecord
  include HtmlSanitizeAttributes
  include Discard::Model

  sanitizable :hint, :instructions

  # Placements that point at this canonical definition.
  has_many :requirements, dependent: :nullify

  # Lineage: a definition can be forked from another definition.
  belongs_to :forked_from, class_name: "QuestionDefinition", optional: true
  has_many :forks,
           class_name: "QuestionDefinition",
           foreign_key: :forked_from_id,
           dependent: :nullify,
           inverse_of: :forked_from

  belongs_to :owner, class_name: "User", optional: true

  # input_type vocabulary is shared with Requirement so a placement can inherit
  # it verbatim.
  enum :input_type, Requirement::INPUT_TYPES, prefix: true

  # Governance lifecycle. Only `approved` definitions may be published through a
  # linked placement (enforced in Phase 5).
  enum :review_state, { draft: 0, approved: 1, deprecated: 2 }, prefix: :review

  validates :label, presence: true
  validates :input_type, presence: true

  # When shared content changes, re-materialize linked placements and mark
  # referencing templates drift-pending (Phase 5). Governance/review state-only
  # edits do not trigger drift.
  after_update :record_question_bank_drift, if: :shareable_content_changed?

  scope :approved, -> { review_approved }

  SHAREABLE_COLUMNS = %w[
    label
    hint
    instructions
    input_type
    input_options
  ].freeze

  # Fields a placement inherits from its definition. `requirement_code` is
  # intentionally excluded: the canonical code lives here, but each placement
  # keeps its own code so integration mappings and in-block conditionals do not
  # break.
  RESOLVABLE_FIELDS = %w[
    label
    hint
    instructions
    input_type
    input_options
  ].freeze

  # Returns the attribute hash a linked placement inherits, before per-placement
  # local overrides are applied.
  def resolvable_attributes
    {
      "label" => label,
      "hint" => hint,
      "instructions" => instructions,
      "input_type" => input_type,
      "input_options" => (input_options || {})
    }
  end

  def placements_count
    requirements.count
  end

  # Re-materializes the resolved values onto every linked placement. Called when
  # the definition's shareable content changes so the authoring/canonical
  # records reflect the shared edit. Live published TemplateVersions are NOT
  # touched here; that happens only through the publish flow (see Phase 5
  # drift handling).
  def propagate_to_placements!
    requirements.find_each { |requirement| requirement.save! }
  end

  # Every placement that references this definition, with its per-context delta.
  # Powers the governance "where-used" view: review == 1 definition + N contexts.
  def where_used
    requirements
      .includes(requirement_block: :requirement_template_sections)
      .map do |requirement|
        requirement.contextual_delta.merge(
          requirement_id: requirement.id,
          requirement_block_name: requirement.requirement_block&.name
        )
      end
  end

  private

  def shareable_content_changed?
    (saved_changes.keys & SHAREABLE_COLUMNS).any?
  end

  def record_question_bank_drift
    QuestionBankDriftService.record_drift!(self)
  end
end
