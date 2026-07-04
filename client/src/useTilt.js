import { useCallback, useRef, useState } from 'react';

// Cursor-following 3D tilt + a "shine" position tracked via CSS custom properties,
// the two ingredients that make a flat card read as a physical object under light.
export function useTilt(maxTiltDeg = 10) {
  const ref = useRef(null);
  const [style, setStyle] = useState({});

  const onMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el || maxTiltDeg === 0) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * maxTiltDeg * 2;
    const rotateX = (0.5 - y) * maxTiltDeg * 2;
    setStyle({
      transform: `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.045)`,
      '--shine-x': `${x * 100}%`,
      '--shine-y': `${y * 100}%`,
      '--shine-opacity': 1,
    });
  }, [maxTiltDeg]);

  const onMouseLeave = useCallback(() => {
    setStyle({});
  }, []);

  return { ref, style, onMouseMove, onMouseLeave };
}
