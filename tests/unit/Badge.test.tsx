import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from '../../src/components/ui/Badge';

describe('Badge Component', () => {
  it('renders the label correctly', () => {
    render(<Badge variant="favorite" label="Tasty Choice" />);
    expect(screen.getByText(/Tasty Choice/i)).toBeInTheDocument();
  });

  it('applies favorite styles and renders the star prefix', () => {
    render(<Badge variant="favorite" label="Tasty Choice" />);
    expect(screen.getByText('★')).toBeInTheDocument();
  });

  it('applies levelup styles and transforms the text to uppercase', () => {
    render(<Badge variant="levelup" label="new level" />);
    expect(screen.getByText('NEW LEVEL')).toBeInTheDocument();
  });
});
