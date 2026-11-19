import { createElement } from 'react';
import { TimeFieldProps } from './TimeField.types';
import { tokens as t } from './tokens';
export function TimeField({
  label,
  value,
  disabled,
  onChange,
}: TimeFieldProps) {
  return createElement('input', {
    type: 'time',
    value,
    disabled,
    'aria-label': label,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      onChange(event.target.value),
    style: {
      boxSizing: 'border-box',
      minHeight: t.size.touch,
      width: 144,
      maxWidth: '100%',
      border: `1px solid ${t.color.border}`,
      borderRadius: t.radius.control,
      padding: t.space.md,
      color: disabled ? t.color.muted : t.color.primary,
      background: t.color.surface,
      fontFamily: t.type.body.fontFamily,
      fontSize: t.type.title.fontSize,
    },
  });
}
