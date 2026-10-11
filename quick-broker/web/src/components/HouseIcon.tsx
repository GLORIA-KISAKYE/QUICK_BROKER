interface Props {
  size?: number;
  color?: string;
  className?: string;
}

export default function HouseIcon({ size = 24, color = 'currentColor', className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="House"
    >
      {/* Roof */}
      <path
        d="M12 3L2 12H5V21H11V15H13V21H19V12H22L12 3Z"
        fill={color}
      />
      {/* Door */}
      <rect x="10" y="15" width="4" height="6" fill="#fff" opacity="0.3" />
      {/* Window left */}
      <rect x="6.5" y="13" width="3" height="3" rx="0.5" fill="#fff" opacity="0.3" />
      {/* Window right */}
      <rect x="14.5" y="13" width="3" height="3" rx="0.5" fill="#fff" opacity="0.3" />
    </svg>
  );
}
