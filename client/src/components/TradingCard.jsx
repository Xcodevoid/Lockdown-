import { CLASS_ICON, classSide } from '../constants';
import { useTilt } from '../useTilt';

// A single reusable "physical" card used everywhere a unit is shown or picked:
// choosing your unit, the reveal moment, Shift Rotation swaps, and event targets
// (Poison/Riot/Reinforcements). Renders as a <button> when interactive, a plain
// <div> otherwise (the reveal overlay just displays cards, doesn't pick them).
export default function TradingCard({
  classKey,
  label,
  counter,
  selected = false,
  disabled = false,
  interactive = true,
  size = 'md',
  onClick,
  className = '',
  style: extraStyle,
}) {
  const side = classSide(classKey);
  const tiltAmount = interactive && !disabled ? 9 : 0;
  const { ref, style, onMouseMove, onMouseLeave } = useTilt(tiltAmount);
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      ref={ref}
      type={onClick ? 'button' : undefined}
      className={`trading-card tc-${side} tc-${size} ${selected ? 'tc-selected' : ''} ${disabled ? 'tc-disabled' : ''} ${className}`}
      style={{ ...extraStyle, ...style }}
      onMouseMove={interactive ? onMouseMove : undefined}
      onMouseLeave={interactive ? onMouseLeave : undefined}
      onClick={onClick}
      disabled={onClick ? disabled : undefined}
    >
      <span className="tc-shine" aria-hidden="true" />
      <span className="tc-frame">
        <span className="tc-art">
          <span className="tc-art-icon">{CLASS_ICON[classKey]}</span>
        </span>
        <span className="tc-nameplate">{label}</span>
      </span>
      {counter != null && <span className="tc-counter">{counter}</span>}
    </Tag>
  );
}
