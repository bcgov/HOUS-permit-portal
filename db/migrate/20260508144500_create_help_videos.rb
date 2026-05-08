class CreateHelpVideos < ActiveRecord::Migration[7.2]
  def change
    create_table :help_video_sections, id: :uuid do |t|
      t.string :title, null: false
      t.text :description
      t.integer :sort_order, null: false, default: 0

      t.timestamps
    end

    add_index :help_video_sections, :sort_order

    create_table :help_videos, id: :uuid do |t|
      t.references :help_video_section,
                   null: false,
                   foreign_key: true,
                   type: :uuid
      t.string :title, null: false
      t.text :description
      t.integer :sort_order, null: false, default: 0
      t.datetime :published_at

      t.timestamps
    end

    add_index :help_videos,
              %i[help_video_section_id sort_order],
              name: "index_help_videos_on_section_and_sort_order"
    add_index :help_videos, :published_at

    create_table :help_video_documents, id: :uuid do |t|
      t.string :type, null: false
      t.references :help_video, null: false, foreign_key: true, type: :uuid
      t.jsonb :file_data
      t.string :scan_status, null: false, default: "pending"

      t.timestamps
    end

    add_index :help_video_documents, :scan_status
    add_index :help_video_documents,
              %i[help_video_id type],
              unique: true,
              name: "index_help_video_documents_on_video_and_type"
  end
end
