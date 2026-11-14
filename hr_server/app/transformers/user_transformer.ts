import type User from '#models/user'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class UserTransformer extends BaseTransformer<User> {
  toObject() {
    const u = this.resource
    return {
      ...this.pick(u, [
        'id',
        'fullName',
        'email',
        'role',
        'status',
        'campusId',
        'phoneNumber',
        'address',
        'birthOfDate',
        'profilePicture',
        'createdAt',
        'updatedAt',
        'initials',
      ]),
      noCheckOut: u.noCheckOut === true || (u.noCheckOut as any) === 1,
      allowWifi: u.allowWifi === true || (u.allowWifi as any) === 1,
      allowOutside: u.allowOutside === true || (u.allowOutside as any) === 1,
    }
  }
}
