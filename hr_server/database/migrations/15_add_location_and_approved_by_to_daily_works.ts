import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'daily_works'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.decimal('lat', 10, 7).nullable()
      table.decimal('lng', 10, 7).nullable()
      table.integer('approved_by').unsigned().nullable()
      table.foreign('approved_by').references('users.id').onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['approved_by'])
      table.dropColumn('lat')
      table.dropColumn('lng')
      table.dropColumn('approved_by')
    })
  }
}
