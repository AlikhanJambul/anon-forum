import { v4 as uuidv4 } from 'uuid';

// Генерируем случайное имя анона, например "Anon #8392"
export const generateAnonName = (): string => {
  const code = Math.floor(Math.random() * 9000) + 1000;
  return `Anon #${code}`;
};

export const generateId = (): string => uuidv4();

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};