import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'campuses'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('wifi_name')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('wifi_name').nullable()
    })
  }
}
