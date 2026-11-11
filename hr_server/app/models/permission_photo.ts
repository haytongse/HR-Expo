import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import UserPermission from '#models/user_permission'

export default class PermissionPhoto extends BaseModel {
  static table = 'permission_photos'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare permissionId: number

  @column()
  declare photoPath: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => UserPermission)
  declare permission: BelongsTo<typeof UserPermission>
}
