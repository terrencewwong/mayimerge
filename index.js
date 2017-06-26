const Hapi = require('hapi')
const GitHubApi = require("github")
const Joi = require('joi')
const { OpenedPREvent, CreateCommentEvent } = require('./schemas')
const { handleGithubWebhook } = require('./handlers')

const server = new Hapi.Server()
server.app.github = new GitHubApi({
  protocol: "https",
  host: "api.github.com",
  headers: {
    "user-agent": "may-I-merge" // GitHub is happy with a unique user agent
  },
  followRedirects: false,
  timeout: 5000
})

server.app.github.authenticate({
  type: 'oauth',
  token: process.env.GH_TOKEN
})

server.connection({ port: 4000 })
server.app.PRIdShaMap = {}
server.route([
  {
    config: {
      description: 'Responds to webhooks from github',
      tags: ['github', 'webhook'],
      validate: {
        payload: Joi.alternatives().try(OpenedPREvent, CreateCommentEvent),
        options: { stripUnknown: true }
      }
    },
    method: 'POST',
    path: '/github/webhook',
    handler: handleGithubWebhook
  }
])

server.register({
  register: require('good'),
  options: {
    reporters: {
      consoleReporter: [
        {
          module: 'good-squeeze',
          name: 'Squeeze',
          args: [{ log: '*', response: '*' }]
        },
        { module: 'good-console' },
        'stdout'
      ]
    }
  }
}, (err) => {
  if (err) throw err

  server.start(err => {
    if (err) throw err

    console.log('Server running at:', server.info.uri)
  })
})
