module.exports = async ({ github, context, core, env = process.env }) => {
  const { data, status } = await github.rest.repos.createDeployment({
    ...context.repo,
    ref: env.DEPLOY_BRANCH,
    environment: env.DEPLOY_ENVIRONMENT,
    description: env.DEPLOY_DESCRIPTION,
    task: 'deploy',
    auto_merge: false,
    required_contexts: [],
    transient_environment: true,
  });
  if (status !== 201 || !Number.isSafeInteger(data.id) || data.id <= 0) {
    throw new Error('Deployment creation did not return a valid deployment ID');
  }
  core.setOutput('deployment_id', data.id);
  core.setOutput('env', env.DEPLOY_ENVIRONMENT);
  await github.rest.repos.createDeploymentStatus({
    ...context.repo,
    deployment_id: data.id,
    state: 'in_progress',
    description: env.DEPLOY_DESCRIPTION,
    log_url: env.DEPLOY_LOG_URL,
    auto_inactive: false,
  });
};
