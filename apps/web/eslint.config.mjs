import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  ...nx.configs['flat/react'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      // Desabilitar regras problemáticas para Windows
      'linebreak-style': 'off',
      // Permitir function declarations além de arrow functions
      'react/function-component-definition': 'off',
      // Emojis não precisam de span acessível (opcional, pode ser warning)
      'jsx-a11y/accessible-emoji': 'warn',
      // Permitir any em casos específicos (warning em vez de error)
      '@typescript-eslint/no-explicit-any': 'warn',
      // Ordenação de imports flexível
      'import/order': 'off',
    },
  },
];
