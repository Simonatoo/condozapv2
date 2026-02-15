function ActionSheetItem({ label, icon, onClick, variant = 'default' }) {
    const variants = {
        default: {
            bg: 'bg-gray-500/20',
            text: 'text-body'
        },
        destructive: {
            bg: 'bg-red-500/15',
            text: 'text-red-500'
        }
    };

    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-center w-full py-3 text-body ${variants[variant].bg} ${variants[variant].text} rounded-full`}
        >
            {icon && <span className="mr-2">{icon}</span>}
            <span className="text-md font-normal">{label}</span>
        </button>
    );
}

export default ActionSheetItem;