import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

// Create a strict sanitization schema to prevent XSS attacks from AI-generated content
// We build from scratch rather than spreading defaultSchema to have full control
const sanitizeSchema = {
  // Allow only safe HTML tags commonly used in markdown
  tagNames: [
    'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
    'a', 'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'span', 'div'
  ],
  // Explicit attribute allowlist per tag
  attributes: {
    // Only allow className for styling and syntax highlighting
    '*': ['className'],
    // For links, only allow href and title
    a: ['href', 'title'],
    // For code blocks and spans (syntax highlighting)
    code: ['className'],
    pre: ['className'],
    span: ['className'],
  },
  // Only allow safe protocols for links
  protocols: {
    href: ['http', 'https', 'mailto'],
  },
};

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
          <ReactMarkdown
            rehypePlugins={[
              rehypeRaw,
              [rehypeSanitize, sanitizeSchema],
              rehypeHighlight,
            ]}
          >
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
