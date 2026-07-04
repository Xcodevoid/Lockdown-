import { useEffect, useRef, useState } from 'react';

export function useFlashOnChange(value) {
  const prev = useRef(value);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value;
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 550);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [value]);

  return flash;
}
