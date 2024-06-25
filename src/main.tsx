import React from 'react';
import ReactDOM from 'react-dom/client';
import { OnThisDayList } from './on-this-day-list/on-this-day-list.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OnThisDayList />
  </React.StrictMode>
);
