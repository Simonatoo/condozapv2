import { useState } from 'react';
import ActionSheetItem from "./ActionSheetItem";

function ActionSheet({ options, onClickItem, onClose }) {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handleItemClick = (item) => {
        handleClose();
        onClickItem(item);
    };

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/50 z-50 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
                onClick={handleClose}
            />
            <div
                className={`fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xs rounded-t-3xl z-50 p-4 pb-8 flex flex-col gap-2 ${isClosing ? 'animate-slide-down' : 'animate-slide-up'}`}
            >
                {options.map((e, k) => {
                    if (e.show === false) return null;
                    return (
                        <ActionSheetItem
                            key={k}
                            label={e.label}
                            icon={e.icon}
                            variant={e.variant}
                            onClick={() => {
                                setIsClosing(true);
                                setTimeout(() => {
                                    onClickItem(e);
                                }, 300);
                            }}
                        />
                    );
                })}
            </div>
        </>
    );
}

export default ActionSheet