/**
 * Sistema de logging condicional que só exibe mensagens em desenvolvimento
 */

const IS_DEV = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * Exibe avisos apenas em desenvolvimento
   */
  warn: (...args: unknown[]) => {
    if (IS_DEV) {
      console.warn(...args);
    }
  },

  /**
   * Exibe erros apenas em desenvolvimento
   */
  error: (...args: unknown[]) => {
    if (IS_DEV) {
      console.error(...args);
    }
  },

  /**
   * Exibe informações apenas em desenvolvimento
   */
  info: (...args: unknown[]) => {
    if (IS_DEV) {
      console.log(...args);
    }
  },
};
