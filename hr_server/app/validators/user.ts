import vine from '@vinejs/vine'

/**
 * Shared rules for email and password.
 */
const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)

/**
 * Validator to use when performing self-signup
 */
export const signupValidator = vine.create({
  fullName: vine.string().nullable(),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
})

/**
 * Validator to use before validating user credentials
 * during login
 */
export const loginValidator = vine.create({
  identifier: vine.string().trim(),
  password: vine.string(),
})

/**
 * Validator for admin creating a new user
 */
export const createUserValidator = vine.create({
  fullName: vine.string().nullable(),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
  role: vine.enum(['admin', 'user']),
  phoneNumber: vine.string().nullable().optional(),
  address: vine.string().nullable().optional(),
  birthOfDate: vine.string().nullable().optional(),
  campusId: vine.number().nullable().optional(),
  userCode: vine.string().nullable().optional(),
  status: vine.string().nullable().optional(),
  allowWifi: vine.boolean().optional(),
  noCheckOut: vine.boolean().optional(),
  allowOutside: vine.boolean().optional(),
})
