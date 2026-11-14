import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'public_holidays'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('campus_id').unsigned().nullable().references('id').inTable('campuses').onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('campus_id')
    })
  }
}
