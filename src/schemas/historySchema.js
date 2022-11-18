import joi from "joi";

export const historySchema = joi.object({
  value: joi.number().precision(2).positive().max(99999999).required(),
  description: joi.string().min(3).max(25).required(),
  type: joi.string().required(),
});
