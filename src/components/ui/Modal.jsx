import { forwardRef, useEffect } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

const Modal = forwardRef(({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  description,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  ...props 
}, ref) => {
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e) => {
      if (e.key === "Escape" && closeOnEscape) {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, closeOnEscape]);
  
  if (!isOpen) return null;
  
  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full mx-4",
  };
  
  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />
      
      <div 
        className="relative z-10 flex min-h-full items-center justify-center p-4"
        onClick={closeOnOverlayClick ? onClose : undefined}
      >
        <div
          ref={ref}
          className={`w-full ${sizes[size]} bg-surface rounded-2xl shadow-xl transform transition-all relative`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
          aria-describedby={description ? "modal-description" : undefined}
          {...props}
        >
          {(title || onClose) && (
            <div className="flex items-start justify-between p-4 sm:p-6 border-b border-border">
              <div>
                {title && (
                  <h2 id="modal-title" className="text-xl font-semibold text-text-primary">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="modal-description" className="text-text-secondary text-sm mt-1">
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-slate-100 transition-colors flex-shrink-0 ml-4"
                aria-label="Close modal"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
          )}
          
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
  
  return createPortal(modalContent, document.body);
});

Modal.displayName = "Modal";

export default Modal;