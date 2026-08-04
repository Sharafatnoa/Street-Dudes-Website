import type { MenuCategory } from '@/types/menu';

export const menuCategories: MenuCategory[] = [
  {
    id: 'burgers',
    labelKey: 'menu.categories.burgers',
    items: [
      {
        id: 'truffle-smash',
        nameKey: 'menu.items.truffleSmash.name',
        descriptionKey: 'menu.items.truffleSmash.description',
        price: 99,
        type: 'main',
        badge: 'favorite',
        customization: {
          proteinSwaps: [{ id: 'halloumi', name: 'Halloumi', priceDelta: 10 }],
          ingredients: ['Crispsallad', 'Cheddarost', 'Tryffelmajonnäs', 'Stekt lök', 'Rostad lök'],
          addonIds: ['extra-burgarpuck', 'extra-protein'],
          hasSauceAddon: true,
        },
      },
      {
        id: 'cheese-smash',
        nameKey: 'menu.items.cheeseSmash.name',
        descriptionKey: 'menu.items.cheeseSmash.description',
        price: 99,
        type: 'main',
        customization: {
          proteinSwaps: [{ id: 'halloumi', name: 'Halloumi', priceDelta: 10 }],
          ingredients: ['Cheddarost', 'Senap', 'Ketchup', 'Lök', 'Picklad gurka', 'Majonnäs'],
          addonIds: ['extra-burgarpuck', 'extra-protein'],
          hasSauceAddon: true,
        },
      },
    ],
  },
  {
    id: 'tacos-burritos',
    labelKey: 'menu.categories.tacosBurritos',
    items: [
      {
        id: 'birria-taco',
        nameKey: 'menu.items.birriaTaco.name',
        descriptionKey: 'menu.items.birriaTaco.description',
        price: 109,
        type: 'main',
        customization: {
          proteinSwaps: [{ id: 'halloumi', name: 'Halloumi', priceDelta: 10 }],
          ingredients: ['Högrev', 'Ost', 'Rå lök', 'Koriander', 'Consommé'],
          addonIds: ['extra-protein'],
          hasSauceAddon: true,
        },
      },
      {
        id: 'burrito',
        nameKey: 'menu.items.burrito.name',
        descriptionKey: 'menu.items.burrito.description',
        price: 109,
        type: 'main',
        customization: {
          proteinSwaps: [
            { id: 'kyckling', name: 'Kyckling', priceDelta: 0 },
            { id: 'halloumi', name: 'Halloumi', priceDelta: 10 },
          ],
          ingredients: ['Högrev', 'Signature ris', 'Ost', 'Lök', 'Crunch', 'Streetdudes Dressing'],
          addonIds: ['extra-protein'],
          hasSauceAddon: true,
        },
      },
    ],
  },
  {
    id: 'bowls',
    labelKey: 'menu.categories.bowls',
    items: [
      {
        id: 'hogrev-bowl',
        nameKey: 'menu.items.hogrevBowl.name',
        descriptionKey: 'menu.items.hogrevBowl.description',
        price: 109,
        type: 'main',
        customization: {
          proteinSwaps: [
            { id: 'falafel', name: 'Falafel', priceDelta: 0 },
            { id: 'halloumi', name: 'Halloumi', priceDelta: 10 },
          ],
          riceSwaps: [{ id: 'ris', name: 'Ris', priceDelta: 0 }],
          ingredients: [
            'Långkokt högrev',
            'Signature ris',
            'Koriander',
            'Picklad rödkål',
            'Jalapeñomajonnäs',
            'Streetdudes Dressing',
          ],
          addonIds: ['extra-ris', 'extra-protein'],
          hasSauceAddon: true,
        },
      },
      {
        id: 'kyckling-bowl',
        nameKey: 'menu.items.kycklingBowl.name',
        descriptionKey: 'menu.items.kycklingBowl.description',
        price: 99,
        type: 'main',
        customization: {
          proteinSwaps: [],
          ingredients: [
            'Friterad kyckling',
            'Ris',
            'Picklad rödkål',
            'Chilimajonnäs',
            'Rostad lök',
          ],
          addonIds: ['extra-ris', 'extra-protein'],
          hasSauceAddon: true,
        },
      },
    ],
  },
  {
    id: 'sides',
    labelKey: 'menu.categories.sides',
    items: [
      {
        id: 'pommes',
        nameKey: 'menu.items.pommes.name',
        descriptionKey: 'menu.items.pommes.description',
        price: 29,
        type: 'main',
        customization: {
          proteinSwaps: [],
          ingredients: [],
          addonIds: [],
          hasSauceAddon: false,
        },
      },
      {
        id: 'truffle-gold-fries',
        nameKey: 'menu.items.truffleGoldFries.name',
        descriptionKey: 'menu.items.truffleGoldFries.description',
        price: 59,
        type: 'main',
        badge: 'levelup',
        customization: {
          proteinSwaps: [],
          ingredients: ['Tryffelmajonnäs', 'Parmesan', 'Persilja'],
          addonIds: [],
          hasSauceAddon: true,
        },
      },
      {
        id: 'fried-chicken',
        nameKey: 'menu.items.friedChicken.name',
        descriptionKey: 'menu.items.friedChicken.description',
        price: 49,
        type: 'main',
        customization: {
          proteinSwaps: [],
          ingredients: [],
          addonIds: [],
          hasSauceAddon: false,
        },
      },
    ],
  },
  {
    id: 'sauces',
    labelKey: 'menu.categories.sauces',
    items: [
      {
        id: 'jalapenemajo',
        nameKey: 'menu.items.jalapenemajo.name',
        descriptionKey: 'menu.items.jalapenemajo.description',
        price: 20,
        type: 'sauce_dip',
        customization: {
          proteinSwaps: [],
          ingredients: [],
          addonIds: [],
          hasSauceAddon: false,
        },
      },
      {
        id: 'chilimajonnäs',
        nameKey: 'menu.items.chilimajonnäs.name',
        descriptionKey: 'menu.items.chilimajonnäs.description',
        price: 20,
        type: 'sauce_dip',
        customization: {
          proteinSwaps: [],
          ingredients: [],
          addonIds: [],
          hasSauceAddon: false,
        },
      },
      {
        id: 'tryffelmajonnäs',
        nameKey: 'menu.items.tryffelmajonnäs.name',
        descriptionKey: 'menu.items.tryffelmajonnäs.description',
        price: 20,
        type: 'sauce_dip',
        customization: {
          proteinSwaps: [],
          ingredients: [],
          addonIds: [],
          hasSauceAddon: false,
        },
      },
      {
        id: 'sd-dressing',
        nameKey: 'menu.items.sdDressing.name',
        descriptionKey: 'menu.items.sdDressing.description',
        price: 20,
        type: 'sauce_dip',
        customization: {
          proteinSwaps: [],
          ingredients: [],
          addonIds: [],
          hasSauceAddon: false,
        },
      },
    ],
  },
  {
    id: 'drinks',
    labelKey: 'menu.categories.drinks',
    items: [
      {
        id: 'lask',
        nameKey: 'menu.items.lask.name',
        descriptionKey: 'menu.items.lask.description',
        price: 20,
        type: 'sauce_dip',
        customization: {
          proteinSwaps: [],
          ingredients: [],
          addonIds: [],
          hasSauceAddon: false,
        },
      },
    ],
  },
  {
    id: 'addons',
    labelKey: 'menu.categories.addons',
    items: [
      {
        id: 'extra-burgarpuck',
        nameKey: 'menu.items.extraBurgarpuck.name',
        descriptionKey: 'menu.items.extraBurgarpuck.description',
        price: 49,
        type: 'addon',
        customization: {
          proteinSwaps: [],
          ingredients: [],
          addonIds: [],
          hasSauceAddon: false,
        },
      },
      {
        id: 'extra-protein',
        nameKey: 'menu.items.extraProtein.name',
        descriptionKey: 'menu.items.extraProtein.description',
        price: 49,
        type: 'addon',
        customization: {
          proteinSwaps: [],
          ingredients: [],
          addonIds: [],
          hasSauceAddon: false,
        },
      },
      {
        id: 'extra-ris',
        nameKey: 'menu.items.extraRis.name',
        descriptionKey: 'menu.items.extraRis.description',
        price: 35,
        type: 'addon',
        customization: {
          proteinSwaps: [],
          ingredients: [],
          addonIds: [],
          hasSauceAddon: false,
        },
      },
      {
        id: 'extra-sas',
        nameKey: 'menu.items.extraSas.name',
        descriptionKey: 'menu.items.extraSas.description',
        price: 20,
        type: 'addon',
        customization: {
          proteinSwaps: [],
          ingredients: [],
          addonIds: [],
          hasSauceAddon: false,
        },
      },
    ],
  },
];

export const MENU_DATA = {
  categories: menuCategories,
};

/**
 * Returns all addon items as a flat lookup map by ID.
 * Used by the customization modal to find addon details.
 */
export function getAddonById(id: string) {
  const allItems = menuCategories.flatMap((c) => c.items);
  return allItems.find((item) => item.id === id) ?? null;
}
