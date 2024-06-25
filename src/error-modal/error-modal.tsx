import { useUnit } from 'effector-react';
import {
  $description,
  $title,
  setDialogElement,
  modalClosedByUser,
} from './model';
import './error-modal.css';
import { useRef } from 'react';

export const ErrorModal = () => {
  const [onDialogElementChanged, title, description, onClose] = useUnit([
    setDialogElement,
    $title,
    $description,
    modalClosedByUser,
  ]);
  const dialogElement = useRef<HTMLDialogElement | null>(null);
  return (
    <dialog
      ref={e => {
        onDialogElementChanged(e);
        dialogElement.current = e;
      }}
      onClose={onClose}
      className='dialog'
    >
      <strong>{title}</strong>
      <p>{description}</p>
      <button
        autoFocus
        onClick={() => {
          if (dialogElement.current) {
            dialogElement.current.close();
          }
        }}
      >
        Ok
      </button>
    </dialog>
  );
};
