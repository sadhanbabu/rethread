import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

export default function CountUpNumber({ value, duration = 1, prefix = '', suffix = '', className = '' }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px -50px 0px' });

  // Extract numeric part from value if passed as string/number
  const numericTarget = typeof value === 'number' 
    ? value 
    : parseInt(String(value).replace(/[^0-9]/g, ''), 10) || 0;

  useEffect(() => {
    if (!isInView) return;

    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.floor(easedProgress * numericTarget));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCurrent(numericTarget);
      }
    };

    window.requestAnimationFrame(step);
  }, [isInView, numericTarget, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{isInView ? current : 0}{suffix}
    </span>
  );
}
