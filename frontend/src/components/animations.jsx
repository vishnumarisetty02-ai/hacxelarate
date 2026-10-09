import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook: detects prefers-reduced-motion
 */
function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    const handler = (e) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return prefersReduced;
}

/**
 * Hook: IntersectionObserver trigger for viewport-based reveal
 */
function useInView(options = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px', ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, isInView];
}

/**
 * PageTransition — wraps an entire page with a smooth fade+slide entrance
 */
export function PageTransition({ children, className = '' }) {
  const reduced = usePrefersReducedMotion();

  return (
    <div
      className={className}
      style={reduced ? {} : {
        animation: 'pageEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
    >
      {children}
    </div>
  );
}

/**
 * FadeIn — generic fade + translateY entrance, triggered when scrolled into view
 * Props:
 *   delay: CSS delay string (e.g. '0.1s')
 *   duration: CSS duration string (default '0.5s')
 *   y: translateY offset in px (default 10)
 *   className: additional classes
 */
export function FadeIn({ children, delay = '0s', duration = '0.5s', y = 10, className = '', as: Tag = 'div' }) {
  const reduced = usePrefersReducedMotion();
  const [ref, isInView] = useInView();

  const style = reduced
    ? {}
    : {
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : `translateY(${y}px)`,
        transition: `opacity ${duration} cubic-bezier(0.16, 1, 0.3, 1) ${delay}, transform ${duration} cubic-bezier(0.16, 1, 0.3, 1) ${delay}`,
        willChange: 'opacity, transform'
      };

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}

/**
 * SlideIn — directional slide entrance (left, right, bottom)
 * Props:
 *   direction: 'left' | 'right' | 'bottom' (default 'bottom')
 *   delay: CSS delay string
 *   distance: px offset (default 20)
 */
export function SlideIn({ children, direction = 'bottom', delay = '0s', distance = 20, duration = '0.55s', className = '' }) {
  const reduced = usePrefersReducedMotion();
  const [ref, isInView] = useInView();

  const getTransform = (visible) => {
    if (visible) return 'translate(0, 0)';
    switch (direction) {
      case 'left': return `translateX(-${distance}px)`;
      case 'right': return `translateX(${distance}px)`;
      default: return `translateY(${distance}px)`;
    }
  };

  const style = reduced
    ? {}
    : {
        opacity: isInView ? 1 : 0,
        transform: getTransform(isInView),
        transition: `opacity ${duration} cubic-bezier(0.16, 1, 0.3, 1) ${delay}, transform ${duration} cubic-bezier(0.16, 1, 0.3, 1) ${delay}`,
        willChange: 'opacity, transform'
      };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

/**
 * StaggerText — sequential text/element reveal with ease-out cubic-bezier
 * Props:
 *   delay: delay in seconds (e.g. 0.05, 0.18, 0.28)
 */
export function StaggerText({ children, delay = 0, className = '', as: Tag = 'div' }) {
  const reduced = usePrefersReducedMotion();
  const [ref, isInView] = useInView();

  const style = reduced
    ? {}
    : {
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : 'translateY(10px)',
        transition: `opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        willChange: 'opacity, transform'
      };

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}

/**
 * StaggerContainer — renders children with directional sliding and staggered delays.
 * Left-side: slide from left 20px → 0
 * Center: slide from bottom 15px → 0
 * Right-side: slide from right 20px → 0
 * Staggered delay: 0.10s, 0.20s, 0.30s, 0.40s...
 */
export function StaggerContainer({ children, baseDelay = 0.10, stagger = 0.10, className = '', direction = 'auto' }) {
  const reduced = usePrefersReducedMotion();
  const [ref, isInView] = useInView();

  const childArray = React.Children.toArray(children).filter(Boolean);
  const total = childArray.length;

  const getChildTransform = (index) => {
    if (direction === 'auto') {
      if (index === 0) return 'translateX(-20px)';
      if (index === total - 1 && total > 1) return 'translateX(20px)';
      return 'translateY(15px)';
    }
    switch (direction) {
      case 'left': return 'translateX(-20px)';
      case 'right': return 'translateX(20px)';
      case 'bottom': return 'translateY(15px)';
      default: return 'translateY(10px)';
    }
  };

  return (
    <div ref={ref} className={className}>
      {childArray.map((child, index) => {
        const delay = (baseDelay + index * stagger).toFixed(2);
        const style = reduced
          ? {}
          : {
              opacity: isInView ? 1 : 0,
              transform: isInView ? 'translate(0, 0)' : getChildTransform(index),
              transition: `opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.55s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
              willChange: 'opacity, transform'
            };

        return (
          <div key={child.key || index} style={style}>
            {child}
          </div>
        );
      })}
    </div>
  );
}

/**
 * AnimatedCard — wraps a card with viewport-triggered slide entrance + hover lift.
 * Props:
 *   delay: CSS delay string (e.g. '0.1s')
 *   direction: 'left' | 'right' | 'bottom' (default 'bottom')
 *   hoverGlow: 'blue' | 'red' | 'orange' | 'none' (default 'blue')
 *   className: additional classes
 */
export function AnimatedCard({ children, delay = '0s', direction = 'bottom', hoverGlow = 'blue', className = '' }) {
  const reduced = usePrefersReducedMotion();
  const [ref, isInView] = useInView();

  const getTransform = (visible) => {
    if (visible) return 'translate(0, 0)';
    switch (direction) {
      case 'left': return 'translateX(-20px)';
      case 'right': return 'translateX(20px)';
      default: return 'translateY(15px)';
    }
  };

  const glowClass = {
    blue: 'animated-card-glow-blue',
    red: 'animated-card-glow-red',
    orange: 'animated-card-glow-orange',
    none: ''
  }[hoverGlow] || '';

  const style = reduced
    ? {}
    : {
        opacity: isInView ? 1 : 0,
        transform: getTransform(isInView),
        transition: `opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1) ${delay}, transform 0.55s cubic-bezier(0.16, 1, 0.3, 1) ${delay}`,
        willChange: 'opacity, transform'
      };

  return (
    <div ref={ref} className={`${glowClass} ${className}`} style={style}>
      {children}
    </div>
  );
}
