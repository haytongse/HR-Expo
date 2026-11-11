import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'campuses'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('public_id').nullable().unique().after('code')
      table.string('wifi_name').nullable().after('public_id')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('public_id')
      table.dropColumn('wifi_name')
    })
  }
}
