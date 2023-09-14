import {languageEN} from './en';
import {languageES} from './es';

type LangType = 'es' | 'en';
export const selectedLanguage = (() => {
  const lang: LangType = 'en';

  switch (lang) {
    case 'es':
      return languageES;
    case 'en':
      return languageEN;
    default:
      return languageES;
  }
})();
