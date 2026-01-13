export default {
  namespace: "common",
  en: {
    welcome: "Welcome to React + i18next",
    counter: {
      button: "count is {{count}}",
      description: "Edit <1>src/App.tsx</1> and save to test HMR",
    },
    learnMore: "Click on the Vite and React logos to learn more",
    language: {
      switch: "Switch language",
      current: "Current language: English",
    },
  },
  ru: {
    welcome: "Добро пожаловать в React + i18next",
    counter: {
      button: "счёт: {{count}}",
      description:
        "Отредактируйте <1>src/App.tsx</1> и сохраните, чтобы протестировать HMR",
    },
    learnMore: "Нажмите на логотипы Vite и React, чтобы узнать больше",
    language: {
      switch: "Переключить язык",
      current: "Текущий язык: Русский",
    },
  },
} as const;
