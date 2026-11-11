import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Campus from '#models/campus'
import DailyWorkPhoto from '#models/daily_work_photo'

export default class DailyWork extends BaseModel {
  static table = 'daily_works'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare campusId: number | null

  @column()
  declare year: number

  @column()
  declare month: number

  @column()
  declare day: number

  @column()
  declare time: string

  @column()
  declare description: string | null

  @column()
  declare status: string

  @column()
  declare photoPath: string | null

  @column()
  declare lat: number | null

  @column()
  declare lng: number | null

  @column()
  declare approvedBy: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Campus)
  declare campus: BelongsTo<typeof Campus>

  @belongsTo(() => User, { foreignKey: 'approvedBy' })
  declare approver: BelongsTo<typeof User>

  @hasMany(() => DailyWorkPhoto)
  declare photos: HasMany<typeof DailyWorkPhoto>
}
