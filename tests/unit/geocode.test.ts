import { parseAddressComponents } from '@/lib/geocode';

// Helper to build a minimal address_component shape
function comp(longName: string, types: string[]) {
  return { long_name: longName, short_name: longName, types };
}

describe('parseAddressComponents', () => {
  it('fixture 1: full result (route + street_number + postal_code + postal_town) → all fields filled', () => {
    const components = [
      comp('Bohustgatan', ['route']),
      comp('12', ['street_number']),
      comp('504 35', ['postal_code']),
      comp('Borås', ['postal_town']),
      comp('Sverige', ['country', 'political']),
    ];

    const result = parseAddressComponents(components);

    expect(result.imprecise).toBe(false);
    expect(result.streetAddress).toBe('Bohustgatan 12');
    expect(result.postalCode).toBe('504 35');
    expect(result.city).toBe('Borås');
  });

  it('fixture 2: Plus Code only (no route) → all fields empty, imprecise=true', () => {
    const components = [
      comp('83F4+VC', ['plus_code']),
      comp('Borås Municipality', ['administrative_area_level_2', 'political']),
      comp('Sverige', ['country', 'political']),
    ];

    const result = parseAddressComponents(components);

    expect(result.imprecise).toBe(true);
    expect(result.streetAddress).toBe('');
    expect(result.postalCode).toBe('');
    expect(result.city).toBe('');
  });

  it('fixture 3: route present but no street_number → streetAddress uses route only, imprecise=false', () => {
    // Some Swedish rural addresses have a route but no numbered street
    const components = [
      comp('Landsvägsgatan', ['route']),
      comp('504 50', ['postal_code']),
      comp('Borås', ['postal_town']),
      comp('Sverige', ['country', 'political']),
    ];

    const result = parseAddressComponents(components);

    expect(result.imprecise).toBe(false);
    expect(result.streetAddress).toBe('Landsvägsgatan');
    expect(result.postalCode).toBe('504 50');
    expect(result.city).toBe('Borås');
  });

  it('falls back to locality when postal_town is missing', () => {
    const components = [
      comp('Storgatan', ['route']),
      comp('5', ['street_number']),
      comp('411 01', ['postal_code']),
      comp('Göteborg', ['locality', 'political']),
    ];

    const result = parseAddressComponents(components);

    expect(result.city).toBe('Göteborg');
    expect(result.imprecise).toBe(false);
  });
});
