# Overwrites a shared RequirementBlock (and its requirements) from a
# TemplateVersion snapshot. Does not restore requirement documents / file
# attachments. Affects every template that uses the block.
class RequirementBlockSnapshotRestoreService
  COMPLIANCE_OPTIONS_MAP_PREFIX = "compliance-options-map-prefix-".freeze

  BLOCK_ATTRS = %w[
    name
    description
    display_name
    display_description
    sign_off_role
    reviewer_role
  ].freeze

  REQUIREMENT_ATTRS = %w[
    requirement_code
    label
    input_type
    hint
    instructions
    required
    related_content
    required_for_in_person_hint
    required_for_multiple_owners
    elective
  ].freeze

  def initialize(template_version, requirement_block_id)
    @template_version = template_version
    @requirement_block_id = requirement_block_id.to_s
  end

  def call!
    if @requirement_block_id.blank?
      raise RequirementBlockSnapshotRestoreError,
            I18n.t(
              "services.requirement_block_snapshot_restore_service.missing_block_id"
            )
    end

    snapshot = find_block_snapshot!
    block = RequirementBlock.find_by(id: @requirement_block_id)

    if block.nil?
      raise RequirementBlockSnapshotRestoreError,
            I18n.t(
              "services.requirement_block_snapshot_restore_service.block_not_found"
            )
    end

    ActiveRecord::Base.transaction do
      block.undiscard if block.discarded?

      apply_block_attributes!(block, snapshot)
      sync_requirements!(block, snapshot)

      unless block.save
        raise RequirementBlockSnapshotRestoreError,
              block.errors.full_messages.join(", ")
      end

      block.reload
    end
  end

  private

  def find_block_snapshot!
    blocks_json = @template_version.requirement_blocks_json || {}
    snapshot =
      blocks_json[@requirement_block_id] ||
        blocks_json[@requirement_block_id.to_sym]

    if snapshot.blank?
      raise RequirementBlockSnapshotRestoreError,
            I18n.t(
              "services.requirement_block_snapshot_restore_service.block_not_in_snapshot"
            )
    end

    unless snapshot.is_a?(Hash)
      raise RequirementBlockSnapshotRestoreError,
            I18n.t(
              "services.requirement_block_snapshot_restore_service.malformed_snapshot"
            )
    end

    snapshot
  end

  def apply_block_attributes!(block, snapshot)
    BLOCK_ATTRS.each do |attr|
      value = dig_key(snapshot, attr)
      block.public_send("#{attr}=", value) unless value.nil?
    end

    associations = dig_key(snapshot, "associations")
    block.association_list = Array(associations) if associations
  end

  def sync_requirements!(block, snapshot)
    snapshot_requirements = dig_key(snapshot, "requirements")
    snapshot_requirements = [] unless snapshot_requirements.is_a?(Array)

    snapshot_ids =
      snapshot_requirements.map { |req| dig_key(req, "id") }.compact.map(&:to_s)

    # Update / create from snapshot first so uniqueness checks stay valid,
    # then remove live requirements that are no longer in the snapshot.
    snapshot_requirements.each_with_index do |req_payload, index|
      attrs = requirement_attributes(req_payload, index)
      req_id = dig_key(req_payload, "id")&.to_s

      if req_id.present?
        existing = block.requirements.find_by(id: req_id)
        if existing
          existing.update!(attrs)
        else
          block.requirements.create!(attrs.merge(id: req_id))
        end
      else
        block.requirements.create!(attrs)
      end
    end

    block.requirements.where.not(id: snapshot_ids).find_each(&:destroy!)
  end

  def requirement_attributes(req_payload, position)
    attrs = { position: position }

    REQUIREMENT_ATTRS.each do |attr|
      value = dig_key(req_payload, attr)
      attrs[attr] = value unless value.nil?
    end

    input_options = dig_key(req_payload, "input_options")
    attrs["input_options"] = normalize_input_options(input_options || {})

    attrs
  end

  def normalize_input_options(input_options)
    return {} if input_options.blank?

    opts = input_options.deep_dup
    opts = opts.deep_stringify_keys if opts.respond_to?(:deep_stringify_keys)

    options_map = opts.dig("computed_compliance", "options_map")
    if options_map.is_a?(Hash)
      opts["computed_compliance"][
        "options_map"
      ] = options_map.transform_keys do |key|
        key.to_s.delete_prefix(COMPLIANCE_OPTIONS_MAP_PREFIX)
      end
    end

    opts
  end

  def dig_key(hash, snake_key)
    return nil unless hash.is_a?(Hash)

    key = snake_key.to_s
    camel_key = key.camelize(:lower)
    hash[key] || hash[key.to_sym] || hash[camel_key] || hash[camel_key.to_sym]
  end
end
