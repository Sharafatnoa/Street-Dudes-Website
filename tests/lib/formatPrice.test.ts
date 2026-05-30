import { formatPrice } from '../../src/lib/formatPrice';

describe('formatPrice utility', () => {
  it('formats numeric values into Swedish currency format (SEK)', () => {
    const result = formatPrice(125);
    expect(result).toContain('125');
    expect(result).toContain('kr');
  });

  it('formats 0 correctly', () => {
    const result = formatPrice(0);
    expect(result).toContain('0');
    expect(result).toContain('kr');
  });
});
