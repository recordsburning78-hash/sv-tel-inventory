import Button from './Button.jsx';
import Modal from './Modal.jsx';

export default function ConfirmDialog({ open, title, message, onCancel, onConfirm }) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="max-w-md">
      <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm}>Confirm</Button>
      </div>
    </Modal>
  );
}
