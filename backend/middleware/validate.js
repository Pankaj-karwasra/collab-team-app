const Joi = require('joi');

const schemas = {
  project: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow(''),
    teamId: Joi.string().optional() 
  }),
  task: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow(''),
    status: Joi.string().valid('todo', 'in-progress', 'done'),
    projectId: Joi.string().required(),
    assignedTo: Joi.string().allow(null)
  }),
  message: Joi.object({
    content: Joi.string().required(),
    teamId: Joi.string().required()
  })
};

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

module.exports = { validate, schemas };