import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface InputSectionProps {
  productIdea: string;
  setProductIdea: (value: string) => void;
  customApiKey: string;
  setCustomApiKey: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ productIdea, setProductIdea, customApiKey, setCustomApiKey, onGenerate, isLoading }) => {
  return (
    <div className="card input-section">
      <div className="input-header">
        <div className="icon-wrapper">
          <SparklesIcon />
        </div>
        <h1>Etsy Product Studio</h1>
      </div>
      <p>
        Enter your digital product ideas below (one per line). AI will craft complete Etsy listings and product content for each.
      </p>

      <div>
        <label htmlFor="product-idea">
          Your Digital Product Ideas
        </label>
        <textarea
          id="product-idea"
          rows={5}
          className="textarea"
          placeholder={"e.g., 'Printable Weekly Meal Planner'\n'Digital Wedding Invitation Template'\n'50 Social Media Post Ideas for Realtors'"}
          value={productIdea}
          onChange={(e) => setProductIdea(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <label htmlFor="api-key">
          Optional: Custom Google API Key
        </label>
        <input
          id="api-key"
          type="password"
          className="textarea"
          placeholder="Enter your own Google API Key"
          value={customApiKey}
          onChange={(e) => setCustomApiKey(e.target.value)}
          disabled={isLoading}
          autoComplete="off"
        />
      </div>

      <button
        onClick={onGenerate}
        disabled={isLoading || !productIdea.trim()}
        className="button button-primary"
      >
        {isLoading ? (
          <>
            <SpinnerIcon className="spinner button-icon" />
            Generating...
          </>
        ) : (
          <>
            <SparklesIcon className="button-icon" />
            Generate Content
          </>
        )}
      </button>
    </div>
  );
};