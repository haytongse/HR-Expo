import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'check_ins'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Drop the old foreign key first
      table.dropForeign(['time_table_id'])
    })
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('time_table_id', 'shift_id')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('shift_id', 'time_table_id')
    })
    this.schema.alterTable(this.tableName, (table) => {
      table.foreign('time_table_id').references('time_tables.id').onDelete('SET NULL')
    })
  }
}
