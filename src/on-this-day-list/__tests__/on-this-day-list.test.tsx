import { clearNode, createEffect, createEvent, createStore } from 'effector';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
// import '@testing-library/jest-dom'
import { afterEach, expect, test, vi } from 'vitest';
import { OnThisDayList } from '../on-this-day-list';
import { fetchOnThisDayFx, requestListButtonClicked } from '../model';

vi.mock('../model', () => ({
  $data: createStore(null),
  requestListButtonClicked: createEvent(),
  fetchOnThisDayFx: createEffect(),
}));

afterEach(() => {
  clearNode(requestListButtonClicked);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (fetchOnThisDayFx as any).use(async () => {});
  cleanup();
});

test('click on "Fetch data" button should trigger requestListButtonClicked', () => {
  const watcher = vi.fn();
  requestListButtonClicked.watch(watcher);
  render(<OnThisDayList />);

  fireEvent.click(screen.getByText('Fetch data for today'));

  expect(watcher).toBeCalled();
});

test('loading message should be shown depending on the value of fetchOnThisDayFx.pending', () => {
  render(<OnThisDayList />);

  expect(screen.queryByText('Loading data, please wait...')).toBeNull();

  fetchOnThisDayFx.use(() => new Promise(() => {}));
  act(() => {
    fetchOnThisDayFx();
  });

  expect(screen.queryByText('Loading data, please wait...')).toBeTruthy();
});
