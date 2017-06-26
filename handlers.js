const GUARDIAN = 'paulinagorecka'

const ACTION_MAP = {
  opened: handlePROpened,
  created: handleCommentCreated
}

function handlePROpened (request, reply) {
  const { payload, server } = request
  const { repository, pull_request } = payload
  const sha = pull_request.head.sha

  server.app.PRIdShaMap[pull_request.url] = sha

  server.app.github.repos.createStatus({
    owner: repository.owner.login,
    repo: repository.name,
    sha,
    state: 'pending',
    description: `@${GUARDIAN}, may I merge?`,
    context: 'mayimerge'
  }).then(
    () => reply()
  )
}

function handleCommentCreated (request, reply) {
  const { payload, server } = request
  const { issue, comment, repository, sender } = payload
  const senderUsername = sender.login
  const { body } = comment

  // Do nothing
  if (senderUsername !== GUARDIAN || !body.match(/^approved/i)) {
    return reply()
  }

  const sha = server.app.PRIdShaMap[issue.pull_request.url]

  server.app.github.repos.createStatus({
    owner: repository.owner.login,
    repo: repository.name,
    sha,
    state: 'success',
    description: `@${GUARDIAN}, may I merge?`,
    context: 'mayimerge'
  }).then(
    () => reply()
  )
}

module.exports.handleGithubWebhook = function handleGithubWebhook (request, reply) {
  const { action } = request.payload
  ACTION_MAP[action](request, reply)
}
