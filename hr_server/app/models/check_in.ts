import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import ShiftSchedule from '#models/shift_schedule'

export default class CheckIn extends BaseModel {
  static table = 'check_ins'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number | null

  @column()
  declare latitude: number | null

  @column()
  declare longitude: number | null

  @column()
  declare address: string | null

  @column()
  declare street: string | null

  @column()
  declare village: string | null

  @column()
  declare district: string | null

  @column()
  declare country: string | null

  @column()
  declare photoPath: string | null

  @column()
  declare scanType: 'check_in' | 'check_out'

  @column({ columnName: 'shift_period' })
  declare shiftPeriod: string | null

  @column({ columnName: 'shift_id' })
  declare shiftId: number | null

  @column()
  declare year: number | null

  @column()
  declare month: number | null

  @column()
  declare day: number | null

  @column()
  declare time: string | null

  @column()
  declare dayOfWeek: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => ShiftSchedule, { foreignKey: 'shiftId' })
  declare shiftSchedule: BelongsTo<typeof ShiftSchedule>
}
