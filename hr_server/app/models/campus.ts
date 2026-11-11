import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import CampusWifi from '#models/campus_wifi'

export default class Campus extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare code: string

  @column()
  declare publicId: string | null

  @column()
  declare fullName: string

  @column()
  declare address: string | null

  @column()
  declare phoneNumber: string | null

  @column()
  declare email: string | null

  @column()
  declare website: string | null

  @column()
  declare logo: string | null

  @column()
  declare status: number

  @column()
  declare description: string | null

  @column()
  declare startCounts: number

  @column()
  declare allowMeter: number | null

  @column()
  declare lat: number | null

  @column()
  declare long: number | null

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => CampusWifi)
  declare wifis: HasMany<typeof CampusWifi>
}
