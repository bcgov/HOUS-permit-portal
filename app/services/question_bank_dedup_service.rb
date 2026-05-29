require "digest"
require "json"

# Offline clustering tool for the question bank (Phase 4).
#
# Groups existing Requirement placements by a normalized
# (label, input_type, input_options) signature so a steward can review
# candidate clusters and, opt-in, link each cluster's placements to a single
# canonical QuestionDefinition.
#
# Guarantees:
# - Read-only by default. `cluster_candidates` / `cluster_previews` never write.
# - Linking is value-preserving by default: each placement keeps its current
#   resolved values via `local_overrides`, so the published artifact does NOT
#   change on link. Convergence to the canonical content is an explicit,
#   per-placement choice (`converge_ids`).
# - Reversible: every link can be undone with Requirement#detach (no row
#   collapse, no submission-key rewrite).
class QuestionBankDedupService
  DEFAULT_MIN_CLUSTER_SIZE = 2

  class << self
    # Returns an array of clusters (arrays of Requirement) that share a
    # normalized signature and meet the minimum size.
    def cluster_candidates(
      scope: default_scope,
      min_cluster_size: DEFAULT_MIN_CLUSTER_SIZE
    )
      groups = Hash.new { |hash, key| hash[key] = [] }

      scope
        .includes(:requirement_block)
        .find_each do |requirement|
          next if requirement.label.blank?
          groups[signature_for(requirement)] << requirement
        end

      groups.values.select { |members| members.size >= min_cluster_size }
    end

    # Steward-facing preview: for each cluster, the proposed canonical definition
    # plus a per-placement diff/context so review is "1 definition + N contexts".
    def cluster_previews(
      scope: default_scope,
      min_cluster_size: DEFAULT_MIN_CLUSTER_SIZE
    )
      cluster_candidates(
        scope: scope,
        min_cluster_size: min_cluster_size
      ).map { |members| cluster_preview(members) }
    end

    def cluster_preview(members)
      representative = members.first
      proposed = proposed_definition_attributes(representative)

      {
        signature: signature_for(representative),
        proposed_definition: proposed,
        member_count: members.size,
        members: members.map { |member| member_summary(member, proposed) }
      }
    end

    # Opt-in linking. Creates a canonical QuestionDefinition from
    # `definition_attributes` (defaulting to the first placement's values) and
    # links every placement in `requirement_ids`.
    #
    # By default each placement is linked value-preservingly (its differing
    # shareable values are captured as local_overrides). Pass ids in
    # `converge_ids` to instead adopt the canonical content for those placements.
    def link_cluster!(
      requirement_ids:,
      definition_attributes: nil,
      converge_ids: [],
      owner: nil
    )
      requirements = Requirement.where(id: requirement_ids).to_a
      raise ArgumentError, "no requirements provided" if requirements.empty?

      attrs =
        (
          definition_attributes ||
            proposed_definition_attributes(requirements.first)
        ).stringify_keys

      ActiveRecord::Base.transaction do
        definition =
          QuestionDefinition.create!(
            label: attrs["label"],
            hint: attrs["hint"],
            instructions: attrs["instructions"],
            input_type: attrs["input_type"],
            input_options: normalize_input_options(attrs["input_options"]),
            requirement_code: attrs["requirement_code"],
            review_state: :draft,
            owner: owner
          )

        requirements.each do |requirement|
          overrides =
            if converge_ids.map(&:to_s).include?(requirement.id.to_s)
              {}
            else
              value_preserving_overrides(requirement, definition)
            end

          requirement.link_to_question_definition!(definition, overrides)
        end

        definition
      end
    end

    # Normalized signature used for clustering.
    def signature_for(requirement)
      Digest::MD5.hexdigest(
        JSON.generate(
          [
            normalize_label(requirement.label),
            requirement.input_type,
            normalize_input_options(requirement.input_options)
          ]
        )
      )
    end

    private

    def default_scope
      Requirement.where(question_definition_id: nil)
    end

    def normalize_label(label)
      label.to_s.strip.downcase.gsub(/\s+/, " ")
    end

    # Strips per-placement-only keys so two placements that differ only by their
    # in-block conditional still cluster together.
    def normalize_input_options(input_options)
      options = (input_options || {}).deep_dup
      Requirement::LOCAL_PLACEMENT_INPUT_OPTION_KEYS.each do |key|
        options.delete(key)
      end
      options
    end

    def proposed_definition_attributes(requirement)
      {
        "label" => requirement.label,
        "hint" => requirement.hint,
        "instructions" => requirement.instructions,
        "input_type" => requirement.input_type,
        "input_options" => normalize_input_options(requirement.input_options),
        "requirement_code" => requirement.requirement_code
      }
    end

    def member_summary(requirement, proposed)
      {
        requirement_id: requirement.id,
        requirement_block_id: requirement.requirement_block_id,
        requirement_block_name: requirement.requirement_block&.name,
        requirement_code: requirement.requirement_code,
        required: requirement.required,
        elective: requirement.elective,
        has_conditional: requirement.has_conditional?,
        differs_from_proposed: differing_fields(requirement, proposed)
      }
    end

    # Which shareable fields a placement would have to override to keep its
    # current value if linked to the proposed definition.
    def differing_fields(requirement, proposed)
      fields = []
      fields << "label" if requirement.label != proposed["label"]
      fields << "hint" if requirement.hint != proposed["hint"]
      if requirement.instructions != proposed["instructions"]
        fields << "instructions"
      end
      fields << "input_type" if requirement.input_type != proposed["input_type"]
      if normalize_input_options(requirement.input_options) !=
           normalize_input_options(proposed["input_options"])
        fields << "input_options"
      end
      fields
    end

    # Builds local_overrides that keep the placement's current resolved values
    # unchanged after linking (value-preserving link).
    def value_preserving_overrides(requirement, definition)
      overrides = {}
      overrides["label"] = requirement.label if requirement.label !=
        definition.label
      if requirement.hint != definition.hint
        overrides["hint"] = requirement.hint
      end
      if requirement.instructions != definition.instructions
        overrides["instructions"] = requirement.instructions
      end
      if requirement.input_type != definition.input_type
        overrides["input_type"] = requirement.input_type
      end

      member_options = normalize_input_options(requirement.input_options)
      if member_options != normalize_input_options(definition.input_options)
        overrides["input_options"] = member_options
      end

      overrides
    end
  end
end
