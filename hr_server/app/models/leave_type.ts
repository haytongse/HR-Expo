import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class LeaveType extends BaseModel {
  static table = 'leave_types'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare amount: number

  @column()
  declare status: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
