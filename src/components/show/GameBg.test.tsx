// @vitest-environment jsdom

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import GameBg from './GameBg';

describe('GameBg', () => {
  it('renders the live artwork, dynamic slots, and configured lights', () => {
    const { container, getByText } = render(
      <GameBg
        board={<div>Answer board</div>}
        leftTeam={10}
        rightTeam={20}
        overheadScore={30}
        question="Survey question"
        leftName={<div>Left team</div>}
        rightName={<div>Right team</div>}
      />,
    );

    expect(container.querySelectorAll('#backlights')).toHaveLength(1);
    expect(
      container.querySelectorAll('#backlights > use').length,
    ).toBeGreaterThan(100);
    expect(
      container
        .querySelector<SVGUseElement>('#backlights > use')
        ?.style.getPropertyValue('--backlight-duration'),
    ).toMatch(/s$/);
    expect(getByText('Answer board')).toBeTruthy();
    expect(getByText('Survey question')).toBeTruthy();
    expect(getByText('Left team')).toBeTruthy();
    expect(getByText('Right team')).toBeTruthy();
    expect(getByText('10')).toBeTruthy();
    expect(getByText('20')).toBeTruthy();
    expect(getByText('30')).toBeTruthy();
  });
});
