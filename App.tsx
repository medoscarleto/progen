import { useState, useCallback } from 'react';
import { InputSection } from './components/InputSection';
import { OutputSection } from './components/OutputSection';
import { generateEtsyListing, generateProductContent } from './geminiService';
import type { GeneratedContent } from './types';
import { PasswordProtection } from './components/PasswordProtection';

const SESSION_KEY = 'etsy-studio-authenticated';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  });

  const [productIdea, setProductIdea] = useState<string>('');
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthenticationSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleGenerateContent = useCallback(async () => {
    const ideas = productIdea.trim().split('\n').filter(idea => idea.trim() !== '');
    if (ideas.length === 0) {
      setError('Please enter at least one product idea.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedContent([]);

    try {
      const results = await Promise.all(
        ideas.map(async (idea) => {
          const [listingResult, productResult] = await Promise.all([
            generateEtsyListing(idea, customApiKey),
            generateProductContent(idea, customApiKey)
          ]);
          return {
            id: crypto.randomUUID(),
            idea,
            listing: listingResult,
            product: productResult,
          };
        })
      );
      setGeneratedContent(results);

    } catch (err) {
      console.error(err);
       if (err instanceof Error && err.message.includes("API_KEY")) {
        setError(err.message);
      } else {
        setError('An error occurred while generating content. Please check the console for details and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [productIdea, customApiKey]);

  if (!isAuthenticated) {
    return <PasswordProtection onSuccess={handleAuthenticationSuccess} />;
  }

  return (
    <>
      <main className="container">
        <div className="main-grid">
          <div>
            <InputSection
              productIdea={productIdea}
              setProductIdea={setProductIdea}
              customApiKey={customApiKey}
              setCustomApiKey={setCustomApiKey}
              onGenerate={handleGenerateContent}
              isLoading={isLoading}
            />
          </div>
          <div>
            <OutputSection
              results={generatedContent}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
        <footer className="footer">
          <p>Powered by Google Gemini. Built for creative entrepreneurs.</p>
        </footer>
      </main>
    </>
  );
}

export default App;