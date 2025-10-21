import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: string;
  canonical?: string;
}

/**
 * SEO Head component for managing meta tags
 * Ensures proper SEO optimization for each page
 */
export const SEOHead = ({
  title = 'SwiftFill Pro - AI-Powered Legal Form Assistant',
  description = 'Fill out California FL-320 legal forms quickly and accurately with AI assistance. SwiftFill Pro helps with responsive declarations, property distribution calculations, and more.',
  keywords = ['legal forms', 'California', 'FL-320', 'family law', 'AI assistant', 'form filling', 'property distribution'],
  ogImage = '/og-image.png',
  ogType = 'website',
  canonical,
}: SEOHeadProps) => {
  useEffect(() => {
    // Update title
    document.title = title;

    // Update or create meta tags
    const setMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Standard meta tags
    setMetaTag('description', description);
    setMetaTag('keywords', keywords.join(', '));

    // Open Graph tags
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:type', ogType, true);
    setMetaTag('og:image', ogImage, true);
    setMetaTag('og:site_name', 'SwiftFill Pro', true);

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', ogImage);

    // Canonical URL
    if (canonical) {
      let linkElement = document.querySelector('link[rel="canonical"]');
      
      if (!linkElement) {
        linkElement = document.createElement('link');
        linkElement.setAttribute('rel', 'canonical');
        document.head.appendChild(linkElement);
      }
      
      linkElement.setAttribute('href', canonical);
    }

    // Viewport meta tag
    setMetaTag('viewport', 'width=device-width, initial-scale=1.0');

    // Theme color
    setMetaTag('theme-color', '#2463eb');

  }, [title, description, keywords, ogImage, ogType, canonical]);

  return null;
};

// Preset configurations for different pages
export const SEO_PRESETS = {
  home: {
    title: 'SwiftFill Pro - AI-Powered Legal Form Assistant',
    description: 'Fill out California FL-320 legal forms quickly and accurately with AI assistance. SwiftFill Pro helps with responsive declarations, property distribution calculations, and more.',
    keywords: ['legal forms', 'California', 'FL-320', 'family law', 'AI assistant', 'form filling'],
    canonical: window.location.origin + '/',
  },
  auth: {
    title: 'Sign In - SwiftFill Pro',
    description: 'Sign in to SwiftFill Pro to access your saved legal forms and AI assistance.',
    keywords: ['login', 'sign in', 'authentication', 'SwiftFill Pro'],
    canonical: window.location.origin + '/auth',
  },
  calculator: {
    title: 'Property Distribution Calculator - SwiftFill Pro',
    description: 'Calculate property distribution for California family law cases. Validate Watts charges, detect errors, and generate professional reports.',
    keywords: ['property distribution', 'calculator', 'California', 'family law', 'Watts charges'],
    canonical: window.location.origin + '/distribution-calculator',
  },
};
