import React from 'react';
import type { EtsyListing } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { slugify, stripMarkdown } from '../utils';

interface ListingContentProps {
  content: EtsyListing;
  idea: string;
}

// A component to safely render markdown-like text as React elements
const FormattedDescription: React.FC<{ text: string }> = ({ text }) => {
    const parseInline = (line: string) => {
        const parts = line.split(/(\*\*.*?\*\*)/g).filter(Boolean);
        return parts.map((part, i) =>
            part.startsWith('**') && part.endsWith('**') ?
            <strong key={i}>{part.slice(2, -2)}</strong> :
            part
        );
    };

    const elements: JSX.Element[] = [];
    let currentListItems: string[] = [];

    const flushList = () => {
        if (currentListItems.length > 0) {
            elements.push(
                <ul key={`ul-${elements.length}`}>
                    {currentListItems.map((item, i) => (
                        <li key={i}>{parseInline(item)}</li>
                    ))}
                </ul>
            );
            currentListItems = [];
        }
    };

    text.split('\n').forEach((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('#### ')) {
            flushList();
            elements.push(<h4 key={`h4-${index}`}>{parseInline(trimmedLine.substring(5))}</h4>);
        } else if (trimmedLine.startsWith('### ')) {
            flushList();
            elements.push(<h3 key={`h3-${index}`}>{parseInline(trimmedLine.substring(4))}</h3>);
        } else if (trimmedLine.startsWith('## ')) {
            flushList();
            elements.push(<h2 key={`h2-${index}`}>{parseInline(trimmedLine.substring(3))}</h2>);
        } else if (trimmedLine.startsWith('# ')) {
            flushList();
            elements.push(<h1 key={`h1-${index}`}>{parseInline(trimmedLine.substring(2))}</h1>);
        } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
            currentListItems.push(trimmedLine.substring(2));
        } else if (trimmedLine === '---') {
            flushList();
            elements.push(<hr key={`hr-${index}`} className="result-divider" />);
        } else if (trimmedLine.length > 0) {
            flushList();
            elements.push(<p key={`p-${index}`}>{parseInline(trimmedLine)}</p>);
        } else {
            flushList();
        }
    });

    flushList();

    return <>{elements}</>;
};

export const ListingContent: React.FC<ListingContentProps> = ({ content, idea }) => {
  const handleDownload = () => {
    const { title, tags, description, coverImagePrompts } = content;

    let textContent = `Title:\n${title}\n\n`;
    textContent += `--------------------\n\n`;
    textContent += `Suggested Tags:\n${tags.join(', ')}\n\n`;
    textContent += `--------------------\n\n`;
    textContent += `Product Description:\n${stripMarkdown(description)}\n\n`;
    textContent += `--------------------\n\n`;
    textContent += `Suggested Cover Image Prompts:\n`;
    (coverImagePrompts || []).forEach(prompt => {
      textContent += `- ${prompt}\n`;
    });

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `etsy-listing-${slugify(idea)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="content-header">
         <h2>
          Etsy Listing Details
        </h2>
        <button 
          onClick={handleDownload}
          className="button-link"
        >
          <DownloadIcon className="button-link-icon" />
          Download as .txt
        </button>
      </div>
      
      <div className="content-section">
        <h3 className="listing-title">
          {content.title}
        </h3>
      </div>
      
      <div className="content-section">
        <h4>Suggested Tags</h4>
        <p>
          {content.tags.join(', ')}
        </p>
      </div>
      
      <div className="content-section">
        <h4>Product Description</h4>
        <div className="prose-styles">
          <FormattedDescription text={content.description} />
        </div>
      </div>

      <div className="content-section">
        <h4>Suggested Cover Image Prompts</h4>
        <div className="prompts-container">
          {(content.coverImagePrompts || []).map((prompt, index) => (
            <div key={index} className="prompt-card">
              <p>"{prompt}"</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
