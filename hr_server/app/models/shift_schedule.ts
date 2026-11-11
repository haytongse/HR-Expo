import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class ShiftSchedule extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string | null

  @column()
  declare startDate: string

  @column()
  declare endDate: string

  @column()
  declare createdBy: number | null

  @column()
  declare weeklyRules: object | null

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare createdAt: DateTime

  @column.dateTime()
  declare updatedAt: DateTime | null

  @column()
  declare allowTimeBefore: number | null

  @column()
  declare allowTimeAfter: number | null

  @column()
  declare allowAmountScan: number | null

  @column()
  declare allowTimeSecondScan: number | null
}
