import React, { useEffect, useState } from 'react';

/**
 * Lightweight CountUp component for metric cards and threat counters
 * Animates from 0 -> value over ~1 second with ease-out curve.
 */
export default function CountUp({ value, duration = 1000 }) {
  const [displayValue, setDisplayValue] = useState(0);

  const rawString = String(value ?? 0);
  const hasCommas = rawString.includes(',');
  const cleaned = rawString.replace(/,/g, '');
  const match = cleaned.match(/^([^0-9.]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);

  const prefix = match ? match[1] : '';
  const targetNumber = match ? parseFloat(match[2]) : (typeof value === 'number' ? value : 0);
  const suffix = match ? match[3] : '';
  const isDecimal = match && match[2].includes('.');

  const formatNumber = (num) => {
    if (isDecimal) return num.toFixed(1);
    const rounded = Math.round(num);
    return hasCommas ? rounded.toLocaleString() : rounded;
  };

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(formatNumber(targetNumber));
      return;
    }

    let startTimestamp = null;
    let animationFrameId = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic: 1 - Math.pow(1 - progress, 3)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = easeOut * targetNumber;

      setDisplayValue(formatNumber(current));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(formatNumber(targetNumber));
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [targetNumber, duration, isDecimal, hasCommas]);

  if (!match && isNaN(Number(value))) {
    return <span>{value}</span>;
  }

  return (
    <span>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
