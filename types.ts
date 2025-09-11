export interface EtsyListing {
  title: string;
  tags: string[];
  description: string;
  coverImagePrompts: string[];
}

export interface GeneratedContent {
  id: string;
  idea: string;
  listing: EtsyListing;
  product: string;
}