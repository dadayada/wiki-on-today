import { allSettled, createEvent, fork, Subscription } from 'effector';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { $data, requestListButtonClicked } from '../model';
import { showErrorModal } from '../../error-modal/model';

vi.mock('../../error-modal/model.tsx', () => ({
  showErrorModal: createEvent(),
}));

const defaultHandler = http.get(
  'https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/:mounth/:day',
  ({ params }) => {
    // June 20 causes error
    if (params.day === '20' && params.mounth === '06') {
      return new HttpResponse('Internal error', { status: 500 });
    }
    if (params.day === '21' && params.mounth === '06') {
      return HttpResponse.json({
        events: [
          {
            text: `Some event on ${params.day}/${params.mounth}`,
            year: 1999,
            pages: [],
          },
          {
            text: `Another event on ${params.day}/${params.mounth}`,
            year: 1701,
            pages: [],
          },
          {
            text: `And another event on ${params.day}/${params.mounth}`,
            year: 1800,
            pages: [],
          },
        ],
        births: [],
        deaths: [
          {
            text: `Some event on ${params.day}/${params.mounth}`,
            year: 201,
            pages: [],
          },
          {
            text: `Another event on ${params.day}/${params.mounth}`,
            year: 1701,
            pages: [],
          },
          {
            text: `And another event on ${params.day}/${params.mounth}`,
            year: 1800,
            pages: [],
          },
        ],
        holidays: [],
      });
    }
    return HttpResponse.json({
      events: [
        {
          text: `Some event on ${params.day}/${params.mounth}`,
          year: 1999,
          pages: [],
        },
      ],
    });
  }
);

const server = setupServer(defaultHandler);

describe('user requesting list flow', () => {
  const showErrorModalWatcher = vi.fn();
  let unsubscribeErrorModalWatcher: Subscription;

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
    unsubscribeErrorModalWatcher = showErrorModal.watch(showErrorModalWatcher);
  });

  afterAll(() => {
    server.close();
    unsubscribeErrorModalWatcher();
  });

  beforeEach(() => {
    showErrorModalWatcher.mockClear();
  });

  afterEach(() => {
    server.resetHandlers();
    vi.useRealTimers();
  });

  test('requestListButtonClicked should fetch list for current day and put it to $data', async () => {
    const mockDate = new Date(2024, 0, 1);
    vi.setSystemTime(mockDate);
    const scope = fork();

    await allSettled(requestListButtonClicked, { scope });

    expect(scope.getState($data)).toEqual({
      events: [
        {
          text: `Some event on 01/01`,
          year: 1999,
          pages: [],
        },
      ],
    });
  });

  test('fetched data should sorted by year', async () => {
    const mockDate = new Date(2024, 5, 21);
    vi.setSystemTime(mockDate);
    const scope = fork();

    await allSettled(requestListButtonClicked, { scope });

    expect(scope.getState($data)).toEqual({
      events: [
        {
          text: `Another event on 21/06`,
          year: 1701,
          pages: [],
        },
        {
          text: `And another event on 21/06`,
          year: 1800,
          pages: [],
        },
        {
          text: `Some event on 21/06`,
          year: 1999,
          pages: [],
        },
       
      ],
      births: [],
      deaths: [
        {
          text: `Some event on 21/06`,
          year: 201,
          pages: [],
        },
        {
          text: `Another event on 21/06`,
          year: 1701,
          pages: [],
        },
        {
          text: `And another event on 21/06`,
          year: 1800,
          pages: [],
        },
      ],
      holidays: [],
    });
  });

  test('showErrorModal should be triggered with response if response code is not in 200-299 range', async () => {
    const mockDate = new Date(2024, 5, 20);
    vi.setSystemTime(mockDate);
    const scope = fork();

    await allSettled(requestListButtonClicked, { scope });

    expect(scope.getState($data)).toEqual(null);
    expect(showErrorModalWatcher).toHaveBeenCalledWith({
      title: 'Something went wrong',
      description: 'Internal error',
    });
  });
});
