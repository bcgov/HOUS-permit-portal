# Read-only comparison of a frozen Sidekiq database, across Redis versions.
# Only key fingerprints, element counts and content fingerprints leave the process.
require "digest"
require "redis"

redis =
  Redis.new(
    host: ENV.fetch("REDIS_HOST"),
    db: Integer(ENV.fetch("SIDEKIQ_REDIS_DB", "0"))
  )
unless redis.call("ROLE").first == "master"
  abort "Inventory must be taken on the primary"
end

keys = %w[queues schedule retry dead]
%w[queue:* uniquejobs:*].each do |pattern|
  keys.concat(redis.scan_each(match: pattern).to_a)
end
keys.uniq.sort.each do |key|
  digest = Digest::SHA256.new
  type = redis.type(key)
  add =
    lambda do |value|
      bytes = value.to_s.b
      digest << [bytes.bytesize].pack("Q>") << bytes
    end
  add.call(type)
  count =
    case type
    when "none"
      0
    when "list", "zset"
      length = type == "list" ? redis.llen(key) : redis.zcard(key)
      (0...length).step(500) do |start|
        if type == "list"
          redis.lrange(key, start, start + 499).each(&add)
        else
          redis
            .zrange(key, start, start + 499, with_scores: true)
            .each do |member, score|
              add.call(member)
              add.call([score].pack("G"))
            end
        end
      end
      length
    when "set"
      redis.smembers(key).sort.each(&add).size
    when "hash"
      redis
        .hgetall(key)
        .sort
        .each do |field, value|
          add.call(field)
          add.call(value)
        end
        .size
    when "string"
      add.call(redis.get(key))
      1
    else
      abort "Unsupported inventory key type #{type}"
    end
  puts [Digest::SHA256.hexdigest(key), count, digest.hexdigest].join(" ")
end
