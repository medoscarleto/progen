import React, { useState } from 'react';
import JSZip from 'jszip';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import type { GeneratedContent } from '../types';
import { ResultCard } from './ResultCard';
import { DownloadIcon } from './icons/DownloadIcon';
import { slugify, stripMarkdown, generatePdfFromMarkdown } from '../utils';

interface OutputSectionProps {
  results: GeneratedContent[];
  isLoading: boolean;
  error: string | null;
}

type DownloadFormat = 'docx' | 'pdf';

const SkeletonLoader: React.FC = () => (
    <div className="skeleton-loader">
    {[...Array(2)].map((_, i) => (
      <div key={i}>
        <div className="skeleton-item" style={{ height: '1.25rem', width: '50%', marginBottom: '2rem' }}></div>
        <div className="skeleton-item" style={{ height: '1.5rem', width: '25%', marginBottom: '1rem' }}></div>
        <div className="skeleton-item" style={{ height: '2rem', width: '75%', marginBottom: '1.5rem' }}></div>
        <div className="skeleton-item" style={{ height: '1rem', width: '50%', marginBottom: '1rem' }}></div>
        <div className="skeleton-tags">
          {[...Array(10)].map((_, j) => (
            <div key={j} className="skeleton-item skeleton-tag"></div>
          ))}
        </div>
        <div className="skeleton-item" style={{ height: '1rem', width: '33%', marginTop: '1.5rem', marginBottom: '1rem' }}></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="skeleton-item" style={{ height: '1rem', width: '100%' }}></div>
          <div className="skeleton-item" style={{ height: '1rem', width: '83.33%' }}></div>
        </div>
        {i === 0 && <div className="result-divider" style={{ margin: '2rem 0' }}></div>}
      </div>
    ))}
  </div>
);

export const OutputSection: React.FC<OutputSectionProps> = ({ results, isLoading, error }) => {
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>('docx');
  const hasContent = results.length > 0;

  const handleDownloadAll = async () => {
    const zip = new JSZip();

    const parseRuns = (line: string) => {
        return line.split(/(\*\*.*?\*\*)/g).filter(Boolean).map(part => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return new TextRun({ text: part.slice(2, -2), bold: true });
            }
            return new TextRun(part);
        });
    };

    for (const result of results) {
      const { idea, listing, product } = result;
      const slug = slugify(idea);
      const folder = zip.folder(slug);
      
      if(folder) {
        // Create listing txt
        let listingTextContent = `Title:\n${listing.title}\n\n`;
        listingTextContent += `--------------------\n\n`;
        listingTextContent += `Suggested Tags:\n${listing.tags.join(', ')}\n\n`;
        listingTextContent += `--------------------\n\n`;
        listingTextContent += `Product Description:\n${stripMarkdown(listing.description)}\n\n`;
        listingTextContent += `--------------------\n\n`;
        listingTextContent += `Suggested Cover Image Prompts:\n`;
        (listing.coverImagePrompts || []).forEach(prompt => {
            listingTextContent += `- ${prompt}\n`;
        });
        folder.file(`etsy-listing.txt`, listingTextContent);
        
        // Create product content docx or pdf
        if (downloadFormat === 'pdf') {
            try {
                const pdf = generatePdfFromMarkdown(product);
                const pdfBlob = pdf.output('blob');
                folder.file(`product-content.pdf`, pdfBlob);
            } catch (e) {
                console.error("Error creating PDF for zip:", e);
            }
        } else {
            const productChildren: Paragraph[] = [];
            product.split('\n').forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('#### ')) {
                    productChildren.push(new Paragraph({ children: parseRuns(trimmedLine.substring(5)), heading: HeadingLevel.HEADING_4 }));
                } else if (trimmedLine.startsWith('### ')) {
                    productChildren.push(new Paragraph({ children: parseRuns(trimmedLine.substring(4)), heading: HeadingLevel.HEADING_3 }));
                } else if (trimmedLine.startsWith('## ')) {
                    productChildren.push(new Paragraph({ children: parseRuns(trimmedLine.substring(3)), heading: HeadingLevel.HEADING_2 }));
                } else if (trimmedLine.startsWith('# ')) {
                    productChildren.push(new Paragraph({ children: parseRuns(trimmedLine.substring(2)), heading: HeadingLevel.HEADING_1 }));
                } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                    productChildren.push(new Paragraph({ children: parseRuns(trimmedLine.substring(2)), bullet: { level: 0 } }));
                } else if (trimmedLine === '---') {
                    productChildren.push(new Paragraph(""));
                } else if (trimmedLine.length > 0) {
                    productChildren.push(new Paragraph({ children: parseRuns(trimmedLine) }));
                }
            });
            const productDoc = new Document({ sections: [{ children: productChildren.length > 0 ? productChildren : [new Paragraph('')] }] });
            const productBlob = await Packer.toBlob(productDoc);
            folder.file(`product-content.docx`, productBlob);
        }
      }
    }

    try {
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.download = 'etsy-product-studio-export.zip';
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Error creating zip file:", e);
    }
  };


  return (
    <div className="card output-section">
      {isLoading && <SkeletonLoader />}
      {error && <div className="error-message">{error}</div>}
      
      {!isLoading && !error && !hasContent && (
        <div className="output-placeholder">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h2>Your generated content will appear here</h2>
          <p>Enter one or more product ideas and click "Generate Content" to see the magic happen.</p>
        </div>
      )}
      
      {!isLoading && !error && hasContent && (
        <div>
            <div className="output-header">
                <h2>
                    Generated Content ({results.length} {results.length === 1 ? 'result' : 'results'})
                </h2>
                <button 
                  onClick={handleDownloadAll}
                  className="button button-secondary"
                >
                  <DownloadIcon className="button-icon"/>
                  Download All (.zip)
                </button>
            </div>
             <div className="download-options">
                <h4 className="download-options-title">Product Content Format:</h4>
                <div className="download-options-choices">
                    <label>
                        <input type="radio" name="download-format" value="docx" checked={downloadFormat === 'docx'} onChange={() => setDownloadFormat('docx')} />
                        <span>.docx (Word)</span>
                    </label>
                    <label>
                        <input type="radio" name="download-format" value="pdf" checked={downloadFormat === 'pdf'} onChange={() => setDownloadFormat('pdf')} />
                        <span>.pdf</span>
                    </label>
                </div>
            </div>
            <div className="results-container">
                {results.map((result) => (
                    <ResultCard key={result.id} result={result} downloadFormat={downloadFormat}/>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};