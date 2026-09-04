/**
 * High-performance In-Memory Document Store for automated testing without requiring a live MongoDB daemon.
 */

class MockStore {
  constructor() {
    this.collections = {
      users: [],
      expenses: [],
      incomes: [],
      budgets: [],
      goals: [],
      categories: [],
      imports: []
    };
  }

  reset() {
    for (const key of Object.keys(this.collections)) {
      this.collections[key] = [];
    }
  }

  generateId() {
    return '507f1f77bcf86cd79943901' + Math.floor(Math.random() * 10);
  }
}

const store = new MockStore();
module.exports = store;
