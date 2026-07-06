const SvgComponent = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 750 1000"
    className={className}
  >
    <title>X</title>
    <defs>
      <linearGradient id="a">
        <stop
          offset={0}
          style={{
            stopColor: '#e00',
            stopOpacity: 1,
          }}
        />
      </linearGradient>
    </defs>
    <path
      d="M738.388 943.994H611.52L376.442 558.416l-238.81 385.578H19.473l294.78-462.693L38.13 55.92h124.38l217.665 348.264L599.082 55.921h118.161l-274.88 422.892Z"
      aria-label="X"
      style={{
        fontSize: '1243.8px',
        fill: '#e00',
        stroke: '#000',
        strokeWidth: 10,
      }}
      transform="scale(1.0003 .9997)"
    />
    <path
      d="M0 0v1000h750V0Zm74.072 74.072h601.856v851.856H74.072Z"
      style={{
        color: '#000',
        fill: '#ef0000',
        fillOpacity: 1,
        stroke: '#000',
        strokeOpacity: 1,
        strokeWidth: 10,
        strokeDasharray: 'none',
        strokeDashoffset: 0,
        strokeLinejoin: 'bevel',
      }}
    />
  </svg>
);
export default SvgComponent;
