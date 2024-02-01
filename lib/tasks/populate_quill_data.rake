namespace :db do
  desc "Populate quill HTML data for all jurisdictions, not to be run in production"
  task populate_quill: :environment do
    return Rails.env.production?
    
    description_html = <<~HTML
      <h2>Jurisdiction Overview</h2>
      <p>
        Our jurisdiction encompasses a diverse community with a strong commitment to environmental sustainability,
        economic growth, and social equity. We strive to provide services that meet the needs of all our residents.
      </p>
    HTML

    checklist_html = <<~HTML
      <ul>
        <li>Checklist Item 1</li>
        <li>Checklist Item 2</li>
      </ul>
    HTML

    look_out_html = <<~HTML
      <ol>
        <li>Look Out Point 1</li>
        <li>Look Out Point 2</li>
      </ol>
    HTML

    contact_summary_html = <<~HTML
      <h3>Contact Information</h3>
      <p>For more information, please reach out to our office:</p>
      <p>Email: contact@example.com</p>
      <p>Phone: 123-456-7890</p>
    HTML

    Jurisdiction.update_all(
      description_html: description_html,
      checklist_html: checklist_html,
      look_out_html: look_out_html,
      contact_summary_html: contact_summary_html
    )
  end
end
