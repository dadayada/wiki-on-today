import { useUnit } from 'effector-react';
import './on-this-day-list.css';
import {
  $data,
  requestListButtonClicked,
  fetchOnThisDayFx,
  SectionData,
} from './model';
import { ErrorModal } from '../error-modal/error-modal';

interface SectionProps {
  title: string;
  data: SectionData;
}

function Section({ data, title }: SectionProps) {
  return (
    <section>
      <h2>{title}</h2>
      <ul>
        {data.map((el, i) => (
          <li key={i}>
            {el.year && (
              <>{el.year > 0 ? el.year : `${Math.abs(el.year)} BC`} – </>
            )}
            {el.text}
          </li>
        ))}
      </ul>
    </section>
  );
}

function OnThisDayList() {
  const [handleClick, loading, data] = useUnit([
    requestListButtonClicked,
    fetchOnThisDayFx.pending,
    $data,
  ]);
  return (
    <>
      {data ? (
        <>
          <h2>Today is {new Date().toDateString()}</h2>
          {data.events && <Section title='Events' data={data.events} />}
          {data.births && <Section title='Births' data={data.births} />}
          {data.deaths && <Section title='Deaths' data={data.deaths} />}
          {data.holidays && (
            <Section title='Holidays and observances' data={data.holidays} />
          )}
        </>
      ) : (
        <div>
          <button
            disabled={loading}
            onClick={handleClick}
            aria-busy={loading}
            aria-label='Fetch data for today'
          >
            Fetch data for today
          </button>
          {loading && <p aria-live='polite'>Loading data, please wait...</p>}
        </div>
      )}
      <ErrorModal />
    </>
  );
}

export { OnThisDayList };
