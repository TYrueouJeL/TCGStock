import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cards'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.integer('game_id').notNullable().unsigned().references('id').inTable('games')
      table.integer('extension_id').notNullable().unsigned().references('id').inTable('extensions')
      table.integer('rarity_id').notNullable().unsigned().references('id').inTable('rarities')
      table.string('name', 160).notNullable()
      table.string('number', 40).notNullable()
      table.string('language', 8).notNullable()
      table.string('condition', 8).notNullable()
      table.string('finish', 32).notNullable()
      table.integer('quantity').notNullable().defaultTo(1)
      table.decimal('purchase_price', 10, 2).nullable()
      table.decimal('value', 10, 2).nullable()
      table.string('location', 160).notNullable()
      table.text('notes').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.index(['user_id', 'game_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
