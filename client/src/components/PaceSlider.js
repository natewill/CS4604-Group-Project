import { formatPace } from '../utils/paceFormatters';
import '../styles/RunFinder.css';

const PACE_MIN_SECONDS = 240; // 4:00
const PACE_MAX_SECONDS = 900; // 15:00
const PACE_STEP = 15; // how many seconds to increment by when the user slides the slider

/**
 * PaceSlider component - stores pace values in seconds
 * @param {string} label - The label for the slider
 * @param {number|string} value - The current value of the slider in seconds (or empty string)
 * @param {function} onChange - The function to call when the slider value changes (receives seconds as number)
 * @param {number} defaultValue - The default value of the slider in seconds
 * @returns {React.ReactNode} The PaceSlider component
 */
const PaceSlider = ({ label, value, onChange, defaultValue }) => (
  <div>
    <label>
      {label}: {value ? formatPace(value) : '--:--'}
    </label>
    <input 
      type="range" 
      min={PACE_MIN_SECONDS} 
      max={PACE_MAX_SECONDS} 
      step={PACE_STEP}
      value={value || defaultValue}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      style={{ width: '100%' }}
    />
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span>{formatPace(PACE_MIN_SECONDS)}</span>
      <span>{formatPace(PACE_MAX_SECONDS)}</span>
    </div>
  </div>
);

export default PaceSlider;

