import React from 'react';
import type { GeneratedContent } from '../types';
import { ListingContent } from './ListingContent';
import { ProductContent } from './ProductContent';

interface ResultCardProps {
    result: GeneratedContent;
    downloadFormat: 'docx' | 'pdf';
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, downloadFormat }) => {
    return (
        <div className="result-card">
             <h2>
                <span>Idea: </span>{result.idea}
            </h2>
            <div className="listing-content">
                <ListingContent content={result.listing} idea={result.idea} />
            </div>
            <div className="result-divider"></div>
            <div className="product-content">
                <ProductContent content={result.product} idea={result.idea} downloadFormat={downloadFormat} />
            </div>
        </div>
    )
}