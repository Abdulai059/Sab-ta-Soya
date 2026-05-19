"use client"


import { useOutsideClick } from "@/hooks/useOutsideClick";
import { X } from "lucide-react";
import { createContext, useContext, useState, cloneElement } from "react";
import { createPortal } from "react-dom";


const ModalContext = createContext();

function Modal({ children }) {
  const [openName, setOpenName] = useState("");
  const close = () => setOpenName("");
  const open = setOpenName;

  return (
    <ModalContext.Provider value={{ openName, open, close }}>{children}</ModalContext.Provider>
  );
}

function Open({ children, opens: opensWindowName, onOpen }) {
  const { open } = useContext(ModalContext);

  const handleClick = () => {
    if (onOpen) {
      onOpen();
    }
    open(opensWindowName);
  };

  return cloneElement(children, { onClick: handleClick });
}

function Window({ children, name }) {
  const { openName, close, open } = useContext(ModalContext);
  const ref = useOutsideClick(close);

  if (name !== openName) return null;

  // Determine switch handlers based on current modal
  const switchHandlers = {
    onSwitchToSignUp: name === "sign-in" ? () => open("sign-up") : undefined,
    onSwitchToSignIn: name === "sign-up" ? () => open("sign-in") : undefined,
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm transition-all duration-500 overflow-y-auto">
      <div
        ref={ref}
        className="min-h-screen flex items-center justify-center p-2 sm:p-4"
      >
        <div className="relative w-full max-w-4xl">
          <button
            onClick={close}
            className="absolute top-40 right-10 z-10 rounded-full p-2 bg-white/90 backdrop-blur-sm shadow-lg transition-all duration-200 hover:bg-white hover:scale-110"
          >
            <X className="h-5 w-5 text-rose-700" />
          </button>

          <div>{cloneElement(children, { onCloseModal: close, ...switchHandlers })}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

Modal.Open = Open;
Modal.Window = Window;

export default Modal;