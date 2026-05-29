namespace :question_bank do
  desc "Report candidate duplicate-question clusters. MIN_CLUSTER_SIZE=2 by default."
  task dedup_report: :environment do
    min_cluster_size = (ENV["MIN_CLUSTER_SIZE"] || 2).to_i

    previews =
      QuestionBankDedupService.cluster_previews(
        min_cluster_size: min_cluster_size
      )

    if previews.empty?
      puts "No duplicate clusters found (min cluster size #{min_cluster_size})."
      next
    end

    puts "Found #{previews.size} candidate cluster(s):"
    puts

    previews.each_with_index do |cluster, index|
      proposed = cluster[:proposed_definition]
      puts "Cluster ##{index + 1} (#{cluster[:member_count]} placements)"
      puts "  Proposed label:      #{proposed["label"]}"
      puts "  Proposed input_type: #{proposed["input_type"]}"
      puts "  Signature:           #{cluster[:signature]}"
      cluster[:members].each do |member|
        differs =
          if member[:differs_from_proposed].present?
            " [differs: #{member[:differs_from_proposed].join(", ")}]"
          else
            ""
          end
        puts "    - #{member[:requirement_block_name]} / #{member[:requirement_code]}#{differs}"
      end
      puts
    end

    puts "Linking is opt-in via the steward UI (POST question_definitions/apply_dedup) and reversible."
  end
end
