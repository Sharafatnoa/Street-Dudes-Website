import { MENU_DATA } from '../../src/data/menu';

describe('Menu content structure validation', () => {
  const allItems = MENU_DATA.categories.flatMap((category) => category.items);

  it('verifies that every item has a non-zero, non-empty string ID', () => {
    allItems.forEach((item) => {
      expect(item.id).toBeDefined();
      expect(item.id.length).toBeGreaterThan(0);
    });
  });

  it('verifies that every item with a price > 0 has a valid numeric price', () => {
    allItems.forEach((item) => {
      if (item.price !== undefined && item.price > 0) {
        expect(typeof item.price).toBe('number');
        expect(Number.isNaN(item.price)).toBe(false);
      }
    });
  });

  it('verifies that no duplicate item IDs exist across categories', () => {
    const ids = allItems.map((item) => item.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });
});
