export default function LanguageToggle({ lang, setLang }) {
  return (
    <div className="lang-toggle" role="group" aria-label="Language / 语言">
      <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>
        English
      </button>
      <button className={lang === 'zh' ? 'active' : ''} onClick={() => setLang('zh')}>
        中文
      </button>
    </div>
  );
}
