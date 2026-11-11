import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import LeaveType from '#models/leave_type'
import PermissionPhoto from '#models/permission_photo'

export default class UserPermission extends BaseModel {
  static table = 'user_permissions'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare type: string

  @column()
  declare leaveTypeId: number | null

  @column()
  declare startDate: string

  @column()
  declare endDate: string

  @column()
  declare amountDay: number

  @column()
  declare reason: string | null

  @column()
  declare photoPath: string | null

  @column()
  declare status: string

  @column()
  declare approvedBy: number | null

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'approvedBy' })
  declare approver: BelongsTo<typeof User>

  @belongsTo(() => LeaveType, { foreignKey: 'leaveTypeId' })
  declare leaveType: BelongsTo<typeof LeaveType>

  @hasMany(() => PermissionPhoto, { foreignKey: 'permissionId' })
  declare photos: HasMany<typeof PermissionPhoto>
}
