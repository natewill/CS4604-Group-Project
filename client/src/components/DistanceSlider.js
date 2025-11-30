import '../styles/RunFinder.css';

const DISTANCE_MIN = 0; // 0 miles
const DISTANCE_MAX = 30; // 30 miles
const DISTANCE_STEP = 0.5; // increment by 0.5 miles

/**
 * DistanceSlider component - stores distance values in miles
 * @param {string} label - The label for the slider
 * @param {number|string} value - The current value of the slider in miles (or empty string)
 * @param {function} onChange - The function to call when the slider value changes (receives miles as number)
 * @param {number} defaultValue - The default value of the slider in miles
 * @returns {React.ReactNode} The DistanceSlider component
 */
const DistanceSlider = ({ label, value, onChange, defaultValue }) => (
  <div>
    <label>
      {label}: {value !== "" && value !== null && value !== undefined ? `${value} mi` : '--'}
    </label>
    <input
      type="range"
      min={DISTANCE_MIN}
      max={DISTANCE_MAX}
      step={DISTANCE_STEP}
      value={value !== "" && value !== null && value !== undefined ? value : defaultValue}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      style={{ width: '100%' }}
    />
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span>{DISTANCE_MIN} mi</span>
      <span>{DISTANCE_MAX} mi</span>
    </div>
  </div>
);

export default DistanceSlider;
