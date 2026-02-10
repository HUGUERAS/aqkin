import { useRef, useCallback } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Digite sua pergunta...',
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  const handleSend = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const value = el.value.trim();
    if (!value) return;
    onSend(value);
    el.value = '';
    el.style.height = 'auto';
  }, [onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="ai-bot-input-container">
      <textarea
        ref={textareaRef}
        className="ai-bot-input"
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        onInput={handleResize}
        onKeyDown={handleKeyDown}
        style={{ resize: 'none', overflow: 'hidden' }}
      />
      <button
        className="ai-bot-send-btn"
        onClick={handleSend}
        disabled={disabled}
        aria-label="Enviar mensagem"
      >
        <Send size={18} />
      </button>
    </div>
  );
}
