/**
 * ToolButton Component
 * Individual tool button with icon, label, and optional shortcut
 */

import Icon from '../Icon';
import '../../styles/tools/ToolButton.css';

interface ToolButtonProps {
  id: string;
  label: string;
  icon: 'edit-3' | 'compass' | 'ruler' | 'map' | 'grid' | 'search' | 'download' | 'upload' | 'file' | 'plus' | 'filter' | 'move' | 'check-circle' | 'trash' | 'save' | 'close' | 'info' | 'alert' | 'eye' | 'lock' | 'user' | 'back' | 'forward' | 'home' | 'building' | 'list' | 'dashboard' | 'envelope' | 'credit-card' | 'inbox' | 'loader' | 'check' | 'check-2' | 'spark' | 'chart' | 'dollar' | 'logout' | 'menu' | 'edit' | 'eye-off' | 'map-pin' | 'users';
  description?: string;
  shortcut?: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export default function ToolButton({
  id,
  label,
  icon,
  description,
  shortcut,
  active,
  disabled = false,
  onClick,
}: ToolButtonProps) {
  return (
    <button
      className={`tool-button ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
      title={description}
      disabled={disabled}
      onClick={onClick}
      data-tool-id={id}
      aria-label={description || label}
      aria-pressed={active}
    >
      <Icon name={icon} size="md" />
      <span className="tool-label">{label}</span>
      {shortcut && <kbd className="tool-shortcut">{shortcut}</kbd>}
    </button>
  );
}
