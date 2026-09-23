import { useState } from 'react';

export default function Translator() {
  const [isEnToId, setIsEnToId] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>("");
  const [resultText, setResultText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setResultText("");

    const langPair = isEnToId ? "en|id" : "id|en";
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      inputText
    )}&langpair=${langPair}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.responseData) {
        setResultText(data.responseData.translatedText);
      } else {
        setResultText("Gagal menerjemahkan teks.");
      }
    } catch (error) {
      console.error("Error translating:", error);
      setResultText("Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleDirection = () => {
    setIsEnToId(!isEnToId);
    setInputText("");
    setResultText("");
  };

  return (
    <div style={{ maxWidth: '450px', margin: '2rem auto', padding: '1.5rem', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'sans-serif', background: '#fff' }}>
      <h2>Penerjemah ID ⇄ EN</h2>

      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Mode: <strong>{isEnToId ? "English ➔ Indonesia" : "Indonesia ➔ English"}</strong></span>
        <button 
          onClick={handleToggleDirection}
          style={{ padding: '0.5rem 1rem', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Tukar Arah 🔄
        </button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          {isEnToId ? "Masukkan teks Bahasa Inggris:" : "Masukkan teks Bahasa Indonesia:"}
        </label>
        <textarea 
          rows={3}
          value={inputText} 
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isEnToId ? "Type something in English..." : "Ketik sesuatu dalam Bahasa Indonesia..."}
          style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box', resize: 'vertical' }}
        />
      </div>

      <button 
        onClick={handleTranslate}
        disabled={isLoading}
        style={{ width: '100%', padding: '0.7rem', backgroundColor: isLoading ? '#6c757d' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: isLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
      >
        {isLoading ? "Menerjemahkan..." : "Terjemahkan"}
      </button>

      {resultText && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', borderLeft: '4px solid #28a745' }}>
          <strong>Hasil Terjemahan:</strong>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.1rem', color: '#333', whiteSpace: 'pre-wrap' }}>{resultText}</p>
        </div>
      )}
    </div>
  );
}