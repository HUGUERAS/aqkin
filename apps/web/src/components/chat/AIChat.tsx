import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Trash2 } from 'lucide-react';
import apiClient from '../../services/api';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import '../../styles/AIBotChat.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedQuestions?: string[];
}

interface AIChatProps {
  userRole: 'topografo' | 'proprietario';
}

const WELCOME_MESSAGES: Record<string, { content: string; suggestions: string[] }> = {
  topografo: {
    content:
      'Olá! Sou o assistente AI da AtivoReal. Posso ajudá-lo com dúvidas sobre georreferenciamento, normas do INCRA, SIGEF, topologia de parcelas e muito mais. Como posso ajudar?',
    suggestions: [
      'Como funciona a validação topológica?',
      'Quais são os padrões do SIGEF?',
      'Como resolver sobreposição de parcelas?',
    ],
  },
  proprietario: {
    content:
      'Olá! Sou o assistente AI da AtivoReal. Posso ajudá-lo com dúvidas sobre seu imóvel rural, documentação, georreferenciamento e regularização fundiária. Como posso ajudar?',
    suggestions: [
      'O que é georreferenciamento?',
      'Quais documentos preciso enviar?',
      'Como funciona a regularização fundiária?',
    ],
  },
};

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatTime() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function AIChat({ userRole }: AIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && !initializedRef.current) {
      initializedRef.current = true;
      const welcome = WELCOME_MESSAGES[userRole];
      setMessages([
        {
          id: generateId(),
          role: 'assistant',
          content: welcome.content,
          timestamp: formatTime(),
          suggestedQuestions: welcome.suggestions,
        },
      ]);
    }
  }, [isOpen, userRole]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMsg: Message = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: formatTime(),
      };

      // Compute the updated messages array once
      let updatedMessages: Message[] = [];
      setMessages((prev) => {
        updatedMessages = [...prev, userMsg];
        return updatedMessages;
      });
      setIsLoading(true);

      try {
        // Build messages array for API from the updated messages (last 20 for token control)
        const history = updatedMessages
          .filter((m) => !m.suggestedQuestions || m.role === 'user')
          .slice(-20)
          .map((m) => ({ role: m.role, content: m.content }));

        const response = await apiClient.sendChatMessage(history, userRole);

        if (response.error) {
          setMessages((prev) => [
            ...prev,
            {
              id: generateId(),
              role: 'assistant',
              content: `Desculpe, ocorreu um erro: ${response.error}`,
              timestamp: formatTime(),
            },
          ]);
        } else if (response.data) {
          setMessages((prev) => [
            ...prev,
            {
              id: generateId(),
              role: 'assistant',
              content: response.data.response,
              timestamp: formatTime(),
              suggestedQuestions: response.data.suggested_questions,
            },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: 'assistant',
            content: 'Desculpe, não foi possível conectar ao servidor. Tente novamente.',
            timestamp: formatTime(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [userRole],
  );

  const handleSuggestionClick = useCallback(
    (question: string) => {
      sendMessage(question);
    },
    [sendMessage],
  );

  const clearHistory = useCallback(() => {
    initializedRef.current = false;
    setMessages([]);
    const welcome = WELCOME_MESSAGES[userRole];
    initializedRef.current = true;
    setMessages([
      {
        id: generateId(),
        role: 'assistant',
        content: welcome.content,
        timestamp: formatTime(),
        suggestedQuestions: welcome.suggestions,
      },
    ]);
  }, [userRole]);

  return (
    <>
      {/* FAB button */}
      <button
        className={`ai-bot-fab ${isOpen ? 'ai-bot-fab--open' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Fechar chat' : 'Abrir chat'}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="ai-bot-window">
          {/* Header */}
          <div className="ai-bot-header">
            <div className="ai-bot-header-title">
              <MessageCircle size={16} />
              Assistente AtivoReal
            </div>
            <div className="ai-bot-header-actions">
              <button
                className="ai-bot-header-btn"
                onClick={clearHistory}
                aria-label="Limpar conversa"
                title="Limpar conversa"
              >
                <Trash2 size={14} />
              </button>
              <button
                className="ai-bot-header-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Minimizar"
                title="Minimizar"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="ai-bot-messages">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                timestamp={msg.timestamp}
                suggestedQuestions={msg.suggestedQuestions}
                onSuggestionClick={handleSuggestionClick}
              />
            ))}
            {/* eslint-disable-next-line jsx-a11y/aria-role */}
            {isLoading && <ChatMessage role="assistant" content="" isLoading />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <ChatInput onSend={sendMessage} disabled={isLoading} />
        </div>
      )}
    </>
  );
}
