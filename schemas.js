const Joi = require('joi')

const Entity = Joi.object().keys({
  login: Joi.string().required()
})

const Repository = Joi.object().keys({
  name: Joi.string().required(),
  owner: Entity.required()
})

const Head = Joi.object().keys({
  sha: Joi.string().required()
})

const PullRequest = Joi.object().keys({
  head: Head.required(),
  url: Joi.string().required()
})

const ResourceReference = Joi.object().keys({
  url: Joi.string().required()
})

const Issue = Joi.object().keys({
  pull_request: ResourceReference.required()
})

const Comment = Joi.object().keys({
  body: Joi.string().required()
})

module.exports.OpenedPREvent = Joi.object().keys({
  action: 'opened',
  repository: Repository.required(),
  pull_request: PullRequest.required()
})

module.exports.CreateCommentEvent = Joi.object().keys({
  action: 'created',
  issue: Issue.required(),
  comment: Comment.required(),
  repository: Repository.required(),
  sender: Entity.required()
})
