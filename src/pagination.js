function paginate(items, page, perPage) {
    const offset = (page - 1) * perPage;
    return items.slice(offset, offset + perPage);
  }
  
  module.exports = { paginate };
  