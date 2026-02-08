import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  isLoading?: boolean;
  suggestedQuestions?: string[];
  onSuggestionClick?: (question: string) => void;
}

export default function ChatMessage({
  role,
  content,
  timestamp,
  isLoading,
  suggestedQuestions,
  onSuggestionClick,
}: ChatMessageProps) {
  if (isLoading) {
    return (
      <div className="ai-bot-message ai-bot-message--bot">
        <div className="ai-bot-message-content">
          <div className="ai-bot-typing">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`ai-bot-message ai-bot-message--${role === 'user' ? 'user' : 'bot'}`}>
      <div className="ai-bot-message-content">
        {role === 'user' ? (
          <p>{content}</p>
        ) : (
          <ReactMarkdown rehypePlugins={[rehypeHighlight, rehypeRaw]}>
            {content}
          </ReactMarkdown>
        )}
        {timestamp && <span className="ai-bot-message-time">{timestamp}</span>}
        {suggestedQuestions && suggestedQuestions.length > 0 && (
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => onSuggestionClick?.(q)}
                style={{
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: 8,
                  padding: '6px 10px',
                  color: '#93c5fd',
                  fontSize: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'rgba(59, 130, 246, 0.25)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'rgba(59, 130, 246, 0.15)';
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
