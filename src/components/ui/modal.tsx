import { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

const Modal = ({ open, onClose, children, title }: ModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-lg">
        {title && (
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              ×
            </button>
          </div>
        )}
        <div className="p-4">{children}</div>
        <div className="flex justify-end p-4 border-t">
          <button
            onClick={onClose}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;