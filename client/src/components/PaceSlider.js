import { formatPace } from '../utils/formatPace';
import { paceToSeconds } from '../utils/paceToSeconds';

const PACE_MIN_SECONDS = 240; // 4:00
const PACE_MAX_SECONDS = 900; // 15:00
const PACE_STEP = 15;

const labelStyle = { display: 'block', marginBottom: '0.25rem' };

const PaceSlider = ({ label, value, onChange, defaultValue }) => (
  <div>
    <label style={labelStyle}>
      {label}: {value || '--:--'}
    </label>
    <input 
      type="range" 
      min={PACE_MIN_SECONDS} 
      max={PACE_MAX_SECONDS} 
      step={PACE_STEP}
      value={value ? (paceToSeconds(value) || defaultValue) : defaultValue}
      onChange={(e) => onChange(formatPace(parseInt(e.target.value, 10)))}
      style={{ width: '100%' }}
    />
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
      <span>{formatPace(PACE_MIN_SECONDS)}</span>
      <span>{formatPace(PACE_MAX_SECONDS)}</span>
    </div>
  </div>
);

export default PaceSlider;

