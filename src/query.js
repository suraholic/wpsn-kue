const knex = require('./knex')

module.exports = {
  getImageEntries() {
    return knex('image_entry')
  },
  createImageEntry({original_url, thumbnail_url, title, description}) {
    return knex('image_entry')
      .insert({
        original_url,
        thumbnail_url,
        title,
        description
      })
  },
  getImageEntryById(id) {
    return knex('image_entry')
      .where({id})
      .first()
  },
  updateThumbnailUrlByid(id, thumbnail_url) {
    return knex('image_entry')
      .where({id})
      .update({thumbnail_url})
  }
}
