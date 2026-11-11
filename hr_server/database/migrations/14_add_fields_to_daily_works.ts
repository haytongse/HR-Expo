import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'daily_works'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('description').nullable()
      table.string('status', 20).notNullable().defaultTo('pending')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('description')
      table.dropColumn('status')
    })
  }
}
