import { createEvent, createStore, sample } from 'effector';

export const setDialogElement = createEvent<HTMLDialogElement | null>();
export const modalClosedByUser = createEvent<unknown>();
export const showErrorModal = createEvent<{
  title: string;
  description: string;
}>();
export const $title = createStore<string>('');
export const $description = createStore<string>('');

const $dialogElement = createStore<HTMLDialogElement | null>(null);

sample({ clock: setDialogElement, target: $dialogElement });

sample({ clock: showErrorModal, target: $title, fn: ({ title }) => title });
sample({
  clock: showErrorModal,
  target: $description,
  fn: ({ description }) => description,
});

sample({ clock: showErrorModal, source: $dialogElement }).watch(
  dialogElement => {
    if (dialogElement) {
      dialogElement.showModal();
    }
  }
);
