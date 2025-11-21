import React, { useRef, useEffect, useCallback, useState, useId } from 'react';
import './LiquidSlider.css';

export interface LiquidSliderProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  color?: string;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export const LiquidSlider: React.FC<LiquidSliderProps> = ({
  value: controlledValue,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  color = '#007AFF',
  disabled = false,
  label = 'Slider',
  className = '',
}) => {
  const id = useId();
  const filterId = `goo-${id.replace(/:/g, '')}`;
  const knockoutId = `knockout-${id.replace(/:/g, '')}`;
  const removeBlackId = `remove-black-${id.replace(/:/g, '')}`;

  const sliderRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState(controlledValue ?? Math.floor((min + max) / 2));
  const [isActive, setIsActive] = useState(false);
  const [delta, setDelta] = useState(0);
  const [bounceDirection, setBounceDirection] = useState<'top' | 'bottom' | null>(null);

  const value = controlledValue ?? internalValue;

  // Calculate slider-complete (0-100 percentage)
  // Handle edge case where min equals max (division by zero)
  const sliderComplete = (max === min) ? 0 : ((value - min) / (max - min)) * 100;

  // Calculate slider-liquid based on keyframe mapping
  const calculateLiquidValue = useCallback((percentComplete: number) => {
    if (percentComplete <= 10) {
      return (percentComplete / 10) * 50;
    } else if (percentComplete <= 80) {
      return 50;
    } else {
      return 50 + ((percentComplete - 80) / 20) * 50;
    }
  }, []);

  const sliderLiquid = calculateLiquidValue(sliderComplete);

  // Handle input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setInternalValue(newValue);
    onChange?.(newValue);

    // Trigger bounce animation at extremes
    if (newValue === max) {
      setBounceDirection('top');
      setTimeout(() => setBounceDirection(null), 320);
    } else if (newValue === min) {
      setBounceDirection('bottom');
      setTimeout(() => setBounceDirection(null), 320);
    }
  }, [onChange, min, max]);

  // Track pointer movement for delta (squeeze/stretch effect)
  const handlePointerDown = useCallback(() => {
    if (disabled) return;
    setIsActive(true);

    const handlePointerMove = (e: PointerEvent) => {
      setDelta(Math.min(Math.abs(e.movementX), 5));
    };

    const handlePointerUp = () => {
      setDelta(0);
      setIsActive(false);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  }, [disabled]);

  // Handle direct click on track
  const handleTrackClick = useCallback((e: React.PointerEvent) => {
    if (disabled || !inputRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const range = max - min;
    const newValue = Math.round((min + range * ratio) / step) * step;
    const clampedValue = Math.min(max, Math.max(min, newValue));

    setInternalValue(clampedValue);
    onChange?.(clampedValue);
  }, [disabled, min, max, step, onChange]);

  // CSS custom properties for animation
  const sliderStyle = {
    '--slider-complete': Math.round(sliderComplete),
    '--slider-liquid': Math.round(sliderLiquid),
    '--delta': delta,
    '--checked': color,
  } as React.CSSProperties;

  return (
    <div
      ref={sliderRef}
      className={`liquid-slider ${className} ${disabled ? 'liquid-slider--disabled' : ''}`}
      style={sliderStyle}
      data-active={isActive}
      data-bounce={bounceDirection}
    >
      {/* SVG Filters */}
      <svg className="sr-only" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur
              result="blur"
              in="SourceGraphic"
              stdDeviation="13"
            />
            <feColorMatrix
              result="matrix"
              in="blur"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 16 -10
              "
              type="matrix"
            />
            <feComposite
              result="composite"
              in="matrix"
              operator="atop"
            />
          </filter>
          <filter id={knockoutId} colorInterpolationFilters="sRGB">
            <feColorMatrix
              result="knocked"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      -1 -1 -1 1 0"
            />
            <feComponentTransfer>
              <feFuncR type="linear" slope="3" intercept="-1" />
              <feFuncG type="linear" slope="3" intercept="-1" />
              <feFuncB type="linear" slope="3" intercept="-1" />
            </feComponentTransfer>
            <feComponentTransfer>
              <feFuncR type="table" tableValues="0 0 0 0 0 1 1 1 1 1" />
              <feFuncG type="table" tableValues="0 0 0 0 0 1 1 1 1 1" />
              <feFuncB type="table" tableValues="0 0 0 0 0 1 1 1 1 1" />
            </feComponentTransfer>
          </filter>
          <filter id={removeBlackId} colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0
                        0 1 0 0 0
                        0 0 1 0 0
                        -255 -255 -255 0 1"
              result="black-pixels"
            />
            <feMorphology
              in="black-pixels"
              operator="dilate"
              radius="0.5"
              result="smoothed"
            />
            <feComposite in="SourceGraphic" in2="smoothed" operator="out" />
          </filter>
        </defs>
      </svg>

      {/* Knockout layer */}
      <div className="knockout" style={{ filter: `url(#${removeBlackId})` }}>
        <div className="slider__fill"></div>
        <div className="indicator indicator--masked">
          <div className="mask"></div>
        </div>
      </div>

      {/* Track and indicator */}
      <div className="slider__track" onPointerDown={handleTrackClick}>
        <label htmlFor={`slider-${id}`} className="sr-only">{label}</label>
        <input
          ref={inputRef}
          tabIndex={0}
          type="range"
          id={`slider-${id}`}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onPointerDown={handlePointerDown}
          disabled={disabled}
        />
        <div className="indicator__liquid">
          <div className="shadow"></div>
          <div className="wrapper">
            <div className="liquids liquids--track" style={{ filter: `url(#${filterId})` }}>
              <div className="liquid__shadow"></div>
              <div className="liquid__track"></div>
            </div>
            <div className="liquids liquids--fill" style={{ filter: `url(#${filterId})` }}>
              <div className="liquid__shadow"></div>
              <div className="liquid__track"></div>
            </div>
          </div>
          <div className="cover"></div>
        </div>
      </div>
    </div>
  );
};

export default LiquidSlider;
