import { MenuData } from '@/types/menu';

/**
 * Menu Content Source of Truth for Street Dudes.
 * Contains all dishes, pricing details, category groupings, promotional badges,
 * and localization keys.
 *
 * WHY: Prevents hardcoded magic numbers or magic strings in UI files.
 */
export const MENU_DATA: MenuData = {
  categories: [
    {
      id: 'burgers',
      labelKey: 'menu.burgers.title',
      items: [
        {
          id: 'truffle-smash',
          nameKey: 'menu.burgers.truffleSmash.name',
          descriptionKey: 'menu.burgers.truffleSmash.description',
          price: 99,
          badge: 'favorite',
        },
        {
          id: 'cheese-smash',
          nameKey: 'menu.burgers.cheeseSmash.name',
          descriptionKey: 'menu.burgers.cheeseSmash.description',
          price: 99,
        },
      ],
    },
    {
      id: 'tacosAndBurritos',
      labelKey: 'menu.tacosAndBurritos.title',
      items: [
        {
          id: 'birria-taco',
          nameKey: 'menu.tacosAndBurritos.birriaTaco.name',
          descriptionKey: 'menu.tacosAndBurritos.birriaTaco.description',
          price: 109,
          priceLabelKey: 'menu.tacosAndBurritos.birriaTaco.priceLabel',
        },
        {
          id: 'burrito',
          nameKey: 'menu.tacosAndBurritos.burrito.name',
          descriptionKey: 'menu.tacosAndBurritos.burrito.description',
          price: 109,
        },
      ],
    },
    {
      id: 'bowls',
      labelKey: 'menu.bowls.title',
      items: [
        {
          id: 'hogrev-bowl',
          nameKey: 'menu.bowls.hogrevBowl.name',
          descriptionKey: 'menu.bowls.hogrevBowl.description',
          price: 109,
        },
        {
          id: 'kyckling-bowl',
          nameKey: 'menu.bowls.kycklingBowl.name',
          descriptionKey: 'menu.bowls.kycklingBowl.description',
          price: 99,
        },
      ],
    },
    {
      id: 'sides',
      labelKey: 'menu.sides.title',
      items: [
        {
          id: 'pommes',
          nameKey: 'menu.sides.pommes.name',
          descriptionKey: 'menu.sides.pommes.description',
          price: 29,
        },
        {
          id: 'truffle-gold-fries',
          nameKey: 'menu.sides.truffleGoldFries.name',
          descriptionKey: 'menu.sides.truffleGoldFries.description',
          price: 59,
          badge: 'levelup',
        },
        {
          id: 'fried-chicken',
          nameKey: 'menu.sides.friedChicken.name',
          descriptionKey: 'menu.sides.friedChicken.description',
          price: 49,
        },
      ],
    },
    {
      id: 'vegetarian',
      labelKey: 'menu.vegetarian.title',
      items: [
        {
          id: 'falafel',
          nameKey: 'menu.vegetarian.falafel.name',
          descriptionKey: 'menu.vegetarian.falafel.description',
        },
        {
          id: 'friterad-halloumi',
          nameKey: 'menu.vegetarian.friteradHalloumi.name',
          descriptionKey: 'menu.vegetarian.friteradHalloumi.description',
          price: 10,
          isAddon: true,
        },
      ],
    },
    {
      id: 'sauces',
      labelKey: 'menu.sauces.title',
      items: [
        {
          id: 'jalapenomajo',
          nameKey: 'menu.sauces.jalapenomajo.name',
          descriptionKey: 'menu.sauces.jalapenomajo.description',
          price: 20,
        },
        {
          id: 'chilimajonnas',
          nameKey: 'menu.sauces.chilimajonnas.name',
          descriptionKey: 'menu.sauces.chilimajonnas.description',
          price: 20,
        },
        {
          id: 'tryffelmajonnas',
          nameKey: 'menu.sauces.tryffelmajonnas.name',
          descriptionKey: 'menu.sauces.tryffelmajonnas.description',
          price: 20,
        },
        {
          id: 'sd-dressing',
          nameKey: 'menu.sauces.sdDressing.name',
          descriptionKey: 'menu.sauces.sdDressing.description',
          price: 20,
        },
      ],
    },
    {
      id: 'extras',
      labelKey: 'menu.extras.title',
      items: [
        {
          id: 'extra-protein',
          nameKey: 'menu.extras.extraProtein.name',
          descriptionKey: 'menu.extras.extraProtein.description',
          price: 49,
        },
        {
          id: 'extra-burgarpuck',
          nameKey: 'menu.extras.extraBurgarpuck.name',
          descriptionKey: 'menu.extras.extraBurgarpuck.description',
          price: 49,
        },
        {
          id: 'extra-ris',
          nameKey: 'menu.extras.extraRis.name',
          descriptionKey: 'menu.extras.extraRis.description',
          price: 30,
        },
        {
          id: 'extra-texas-ris',
          nameKey: 'menu.extras.extraTexasRis.name',
          descriptionKey: 'menu.extras.extraTexasRis.description',
          price: 35,
        },
        {
          id: 'extra-sas',
          nameKey: 'menu.extras.extraSas.name',
          descriptionKey: 'menu.extras.extraSas.description',
          price: 20,
        },
      ],
    },
    {
      id: 'drinks',
      labelKey: 'menu.drinks.title',
      items: [
        {
          id: 'lask',
          nameKey: 'menu.drinks.lask.name',
          descriptionKey: 'menu.drinks.lask.description',
          price: 20,
        },
      ],
    },
  ],
};
