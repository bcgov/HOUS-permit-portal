module PrintReports
  # Serializes publication of one application's PDFs and ZIPs. PostgreSQL
  # releases the session lock if this connection dies.
  #
  # The lock checks out a pooled connection for the whole block. Do not call
  # Gotenberg, or anything else that can run for a minute, inside it. A render
  # holds that connection until Chromium returns, and Sidekiq will do this for
  # every application at once. Take the lock only around the database write
  # that publishes an already-rendered file or ZIP.
  class ApplicationLock
    def self.synchronize(application_id)
      key =
        Digest::SHA256.digest("print-reports:#{application_id}").unpack1("q>")
      ActiveRecord::Base.connection_pool.with_connection do |connection|
        connection.execute("SELECT pg_advisory_lock(#{key})")
        begin
          yield
        ensure
          connection.execute("SELECT pg_advisory_unlock(#{key})")
        end
      end
    end
  end
end
