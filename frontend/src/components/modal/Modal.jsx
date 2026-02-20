import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Reusable Modal Component
 * 
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Function to call when closing
 * @param {string} title - Title text for the header
 * @param {React.ReactNode} children - Content of the modal
 * @param {Array<{label: string, onClick: function, variant?: 'primary'|'secondary'|'danger'|'outline', disabled?: boolean}>} actions - List of action buttons
 * @param {React.ReactNode} footer - Custom footer content (overrides actions if both provided, or used in conjunction depending on design - usually overrides)
 * @param {string} size - size of the modal: 'sm', 'md', 'lg', 'xl', 'full' (default: 'md')
 */
const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    actions = [],
    footer,
    size = 'md'
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setTimeout(() => setIsAnimating(true), 10); // Small delay for animation
        } else {
            setIsAnimating(false);
            const timer = setTimeout(() => setIsVisible(false), 300); // Wait for transition
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    // Size classes
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        full: 'max-w-full m-4'
    };

    // Button variant styles
    const getButtonStyles = (variant = 'primary') => {
        const base = "px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 text-sm";
        switch (variant) {
            case 'primary':
                return `${base} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`;
            case 'secondary':
                return `${base} bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300`;
            case 'danger':
                return `${base} bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-500`;
            case 'outline':
                return `${base} border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300`;
            default:
                return `${base} bg-blue-600 text-white hover:bg-blue-700`;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Panel */}
            <div
                className={`
                    relative bg-white rounded-2xl shadow-xl w-full flex flex-col max-h-[90vh]
                    transform transition-all duration-300 ease-out
                    ${sizeClasses[size] || sizeClasses.md}
                    ${isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
                `}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                    <h3 id="modal-title" className="text-lg font-semibold text-gray-900">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="px-4 py-4 overflow-y-auto custom-scrollbar">
                    {children}
                </div>

                {/* Footer */}
                {(actions.length > 0 || footer) && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl shrink-0 flex flex-col sm:flex-row items-center justify-end gap-3">
                        {footer ? footer : (
                            actions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={action.onClick}
                                    className={`${getButtonStyles(action.variant)} w-full sm:w-auto`}
                                    disabled={action.disabled}
                                >
                                    {action.label}
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
