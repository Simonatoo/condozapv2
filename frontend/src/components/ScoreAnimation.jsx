import { useState, useEffect } from 'react';

const ScoreAnimation = ({ targetValue, duration = 1500, trigger }) => { // Increased duration a bit for better effect
    const [count, setCount] = useState(0);
    const [scale, setScale] = useState(1);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        let startTime = null;
        let animationFrame;

        const maxScale = 1.3; // Target peak scale

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);

            // Ease-out function for smoother counting
            const easeOutQuad = (t) => t * (2 - t);
            const currentCount = Math.floor(easeOutQuad(percentage) * targetValue);

            // Scale logic: Linearly increase from 1 to maxScale (1.3)
            const currentScale = 1 + ((maxScale - 1) * percentage);

            setCount(currentCount);
            setScale(currentScale);

            if (progress < duration) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                // Animation finished
                setCount(targetValue);
                setScale(maxScale);
                setIsFinished(false); // Reset finish state if re-running (though effect cleans up)

                // Wait 100ms then shrink back fast
                setTimeout(() => {
                    setIsFinished(true); // Enable transition class
                    setScale(1);
                }, 100);
            }
        };

        setCount(0);
        setScale(1);
        setIsFinished(false);
        animationFrame = requestAnimationFrame(animate);

        return () => {
            if (animationFrame) cancelAnimationFrame(animationFrame);
        };
    }, [targetValue, duration, trigger]);

    return (
        <span
            className={`font-bold text-blue-500 text-md mt-2 block transform will-change-transform ${isFinished ? 'transition-transform duration-200 ease-in-out' : ''}`}
            style={{ transform: `scale(${scale})` }}
        >
            + {count} CondoPoints
        </span>
    );
};

export default ScoreAnimation;
