import React from 'react';
import { render, screen } from '@testing-library/react';
import { FlashingLabel } from '../../src/components/ui/FlashingLabel';

describe('FlashingLabel Component', () => {
  it('renders the label correctly', () => {
    render(<FlashingLabel label="Coming Soon!" />);
    expect(screen.getByText('Coming Soon!')).toBeInTheDocument();
  });

  it('applies the custom flashing animation class', () => {
    render(<FlashingLabel label="Coming Soon!" />);
    const labelElement = screen.getByTestId('flashing-label');
    expect(labelElement).toHaveClass('animate-flash-label');
  });

  it('applies the dynamic animation duration style override based on intervalMs', () => {
    render(<FlashingLabel label="Coming Soon!" intervalMs={300} />);
    const labelElement = screen.getByTestId('flashing-label');
    expect(labelElement).toHaveStyle({ animationDuration: '600ms' });
  });
});
