# Rails asset precompilation (including Docker builds) uses vite:build_all rather
# than the npm build script. Include the isolated report bundle in that pipeline.
Rake::Task["vite:build_all"].enhance do
  sh "npm", "run", "build:print"
end
