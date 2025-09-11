import React from 'react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { DownloadIcon } from './icons/DownloadIcon';
import { slugify, generatePdfFromMarkdown } from '../utils';

interface ProductContentProps {
  content: string;
  idea: string;
  downloadFormat: 'docx' | 'pdf';
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

export const ProductContent: React.FC<ProductContentProps> = ({ content, idea, downloadFormat }) => {

  const handleDocxDownload = async () => {
    const children: Paragraph[] = [];
    const parseRuns = (line: string) => {
        return line.split(/(\*\*.*?\*\*)/g).filter(Boolean).map(part => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return new TextRun({ text: part.slice(2, -2), bold: true });
            }
            return new TextRun(part);
        });
    };

    content.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('#### ')) {
            children.push(new Paragraph({ children: parseRuns(trimmedLine.substring(5)), heading: HeadingLevel.HEADING_4 }));
        } else if (trimmedLine.startsWith('### ')) {
            children.push(new Paragraph({ children: parseRuns(trimmedLine.substring(4)), heading: HeadingLevel.HEADING_3 }));
        } else if (trimmedLine.startsWith('## ')) {
            children.push(new Paragraph({ children: parseRuns(trimmedLine.substring(3)), heading: HeadingLevel.HEADING_2 }));
        } else if (trimmedLine.startsWith('# ')) {
            children.push(new Paragraph({ children: parseRuns(trimmedLine.substring(2)), heading: HeadingLevel.HEADING_1 }));
        } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
            children.push(new Paragraph({ children: parseRuns(trimmedLine.substring(2)), bullet: { level: 0 } }));
        } else if (trimmedLine === '---') {
            children.push(new Paragraph(""));
        } else if (trimmedLine.length > 0) {
            children.push(new Paragraph({ children: parseRuns(trimmedLine) }));
        }
    });

    const doc = new Document({
        sections: [{
            children: children.length > 0 ? children : [new Paragraph('')],
        }]
    });
    
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product-content-${slugify(idea)}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePdfDownload = () => {
    try {
        const pdf = generatePdfFromMarkdown(content);
        pdf.save(`product-content-${slugify(idea)}.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
  };

  const handleDownload = () => {
    if (downloadFormat === 'pdf') {
      handlePdfDownload();
    } else {
      handleDocxDownload();
    }
  };

  return (
    <>
      <div className="content-header">
        <h2>
          Digital Product Content
        </h2>
        <button 
          onClick={handleDownload}
          className="button-link"
        >
          <DownloadIcon className="button-link-icon" />
          Download as .{downloadFormat}
        </button>
      </div>

      <div className="product-content-viewer prose-styles">
        <FormattedDescription text={content} />
      </div>
    </>
  );
};
