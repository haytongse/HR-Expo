import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'campus_wifis'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').unsigned().notNullable()
      table
        .integer('campus_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('campuses')
        .onDelete('CASCADE')
      table.string('wifi_name').notNullable()
      table.timestamp('created_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
