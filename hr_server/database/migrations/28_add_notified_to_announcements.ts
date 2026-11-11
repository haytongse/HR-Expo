import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'announcements'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('notified').notNullable().defaultTo(false)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('notified')
    })
  }
}
