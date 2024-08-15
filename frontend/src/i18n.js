import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';
import mr from './locales/mr.json';
import gu from './locales/gu.json';
import bn from './locales/bn.json';
import te from './locales/te.json';
import ta from './locales/ta.json';
import ml from './locales/ml.json';
import kn from './locales/kn.json';

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      hi: {
        translation: hi,
      },
      mr: {
        translation: mr,
      },
      gu: {
        translation: gu,
      },
      bn: {
        translation: bn,
      },
      te: {
        translation: te,
      },
      ta: {
        translation: ta,
      },
      ml: {
        translation: ml,
      },
      kn: {
        translation: kn,
      },
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already does escaping
    },
  });

export default i18n;
