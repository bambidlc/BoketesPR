import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Severity, Status, SEVERITY_CONFIG, STATUS_CONFIG } from '../../types';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'severity' | 'status';
  severity?: Severity;
  status?: Status;
  size?: 'sm' | 'md';
  dot?: boolean;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      severity,
      status,
      size = 'sm',
      dot = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-full';

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
    };

    // Get colors based on variant
    let colorStyles = 'bg-dark-700 text-dark-200';
    let dotColor = 'bg-dark-400';
    let label = children;

    if (variant === 'severity' && severity) {
      const config = SEVERITY_CONFIG[severity];
      colorStyles = `${config.bgColor}/20 ${config.color}`;
      dotColor = config.bgColor;
      label = label || config.labelEs;
    }

    if (variant === 'status' && status) {
      const config = STATUS_CONFIG[status];
      colorStyles = `${config.bgColor}/20 ${config.color}`;
      dotColor = config.bgColor;
      label = label || config.labelEs;
    }

    return (
      <span
        ref={ref}
        className={cn(baseStyles, sizes[size], colorStyles, className)}
        {...props}
      >
        {dot && (
          <span className={cn('w-1.5 h-1.5 rounded-full', dotColor)} />
        )}
        {label}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;

