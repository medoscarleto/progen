import jsPDF from 'jspdf';

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
};

export const markdownToHtml = (text: string): string => {
  const parseInline = (line: string): string => {
    return line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  let html = '';
  let inList = false;

  const flushList = () => {
    if (inList) {
      html += '</ul>';
      inList = false;
    }
  };

  text.split('\n').forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('#### ')) {
      flushList();
      html += `<h4>${parseInline(trimmedLine.substring(5))}</h4>`;
    } else if (trimmedLine.startsWith('### ')) {
      flushList();
      html += `<h3>${parseInline(trimmedLine.substring(4))}</h3>`;
    } else if (trimmedLine.startsWith('## ')) {
      flushList();
      html += `<h2>${parseInline(trimmedLine.substring(3))}</h2>`;
    } else if (trimmedLine.startsWith('# ')) {
      flushList();
      html += `<h1>${parseInline(trimmedLine.substring(2))}</h1>`;
    } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      html += `<li>${parseInline(trimmedLine.substring(2))}</li>`;
    } else if (trimmedLine === '---') {
      flushList();
      html += '<hr />';
    } else if (trimmedLine.length > 0) {
      flushList();
      html += `<p>${parseInline(trimmedLine)}</p>`;
    } else {
       if (!inList) {
         html += '<br/>';
       }
    }
  });

  flushList();
  return html;
};

export const stripMarkdown = (text: string): string => {
  return text
    .replace(/#### (.*)/g, '$1')
    .replace(/### (.*)/g, '$1')
    .replace(/## (.*)/g, '$1')
    .replace(/# (.*)/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/(\r\n|\n|\r)/gm, "\n") // Normalize line breaks
    .trim();
};

export const generatePdfFromMarkdown = (markdown: string): jsPDF => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const margin = 15;
    const pageHeight = pdf.internal.pageSize.getHeight();
    const usableWidth = pdf.internal.pageSize.getWidth() - margin * 2;
    let y = margin;

    const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin) {
            pdf.addPage();
            y = margin;
        }
    };

    const lines = markdown.split('\n');
    let lineSpacing = 5;

    for (const line of lines) {
        const trimmedLine = line.trim();
        const plainText = trimmedLine.replace(/\*\*(.*?)\*\*/g, '$1');

        if (trimmedLine.startsWith('# ')) {
            checkPageBreak(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(20);
            const splitText = pdf.splitTextToSize(plainText.substring(2), usableWidth);
            pdf.text(splitText, margin, y);
            y += (splitText.length * 8) + lineSpacing;
        } else if (trimmedLine.startsWith('## ')) {
            checkPageBreak(10);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(16);
            const splitText = pdf.splitTextToSize(plainText.substring(3), usableWidth);
            pdf.text(splitText, margin, y);
            y += (splitText.length * 6.5) + lineSpacing;
        } else if (trimmedLine.startsWith('### ')) {
            checkPageBreak(8);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(14);
            const splitText = pdf.splitTextToSize(plainText.substring(4), usableWidth);
            pdf.text(splitText, margin, y);
            y += (splitText.length * 5.5) + lineSpacing;
        } else if (trimmedLine.startsWith('#### ')) {
            checkPageBreak(7);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            const splitText = pdf.splitTextToSize(plainText.substring(5), usableWidth);
            pdf.text(splitText, margin, y);
            y += (splitText.length * 5) + lineSpacing;
        } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
            checkPageBreak(5);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            const itemText = `• ${plainText.substring(2)}`;
            const splitText = pdf.splitTextToSize(itemText, usableWidth - 5);
            pdf.text(splitText, margin + 5, y);
            y += (splitText.length * 4.5); // Tighter spacing for list items
        } else if (trimmedLine === '---') {
            checkPageBreak(10);
            y += 5;
            pdf.line(margin, y, usableWidth + margin, y);
            y += 5;
        } else if (trimmedLine.length > 0) {
            checkPageBreak(5);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            const splitText = pdf.splitTextToSize(plainText, usableWidth);
            pdf.text(splitText, margin, y);
            y += (splitText.length * 4.5) + lineSpacing / 2;
        } else {
            checkPageBreak(5);
            y += lineSpacing;
        }
    }
    return pdf;
};
