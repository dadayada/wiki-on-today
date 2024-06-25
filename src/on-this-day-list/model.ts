import { createEffect, createEvent, createStore, sample } from 'effector';
import { showErrorModal } from '../error-modal/model';

export type SectionData = { text: string; year: number; pages: unknown[] }[];

type OnThisDayResponse = {
  selected?: SectionData;
  births?: SectionData;
  deaths?: SectionData;
  events?: SectionData;
  holidays?: SectionData;
};

export const requestListButtonClicked = createEvent();
export const $data = createStore<OnThisDayResponse | null>(null);

export const fetchOnThisDayFx = createEffect<void, OnThisDayResponse>(
  async () => {
    const mounth = `00${new Date().getMonth() + 1}`.slice(-2);
    const day = `0${new Date().getDate()}`.slice(-2);
    const response = await fetch(
      `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/${mounth}/${day}`
    );
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message);
    }
    const json: OnThisDayResponse = await response.json();
    for (const section of Object.values(json)) {
      section.sort((a, b) => a.year < b.year ? -1 : 1);
    }
    return json;
  }
);

sample({ clock: requestListButtonClicked, target: fetchOnThisDayFx });
sample({ source: fetchOnThisDayFx.doneData, target: $data });
sample({
  clock: fetchOnThisDayFx.failData,
  target: showErrorModal,
  fn: ({ message }) => ({
    title: 'Something went wrong',
    description: message,
  }),
});
