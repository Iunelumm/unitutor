import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
}

/**
 * SEO Component for dynamic meta tag updates
 * Use this component on different pages to customize SEO metadata
 */
export function SEO({
  title = 'UniTutor - UCSB Academic Tutoring Platform',
  description = 'Connect with expert UCSB tutors for 220+ courses including ECON 10A, CHEM 109A, PSTAT 8, and more.',
  keywords = 'UCSB tutoring, UCSB tutor, academic tutoring, college tutoring',
  ogImage = 'https://unitutor-production.up.railway.app/og-image.png',
  canonical,
}: SEOProps) {
  const [location] = useLocation();

  useEffect(() => {
    // Update title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Update meta description
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Update Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:url', `https://unitutor-production.up.railway.app${location}`, true);

    // Update Twitter tags
    updateMetaTag('twitter:title', title, true);
    updateMetaTag('twitter:description', description, true);
    updateMetaTag('twitter:image', ogImage, true);

    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonical || `https://unitutor-production.up.railway.app${location}`;
  }, [title, description, keywords, ogImage, canonical, location]);

  return null; // This component doesn't render anything
}

// Predefined SEO configurations for common pages
export const SEO_CONFIGS = {
  home: {
    title: 'UniTutor - UCSB Academic Tutoring Platform | Find Expert Tutors',
    description: 'Connect with expert UCSB tutors for 220+ courses including ECON 10A, CHEM 109A, PSTAT 8, MATH, CMPSC, and more. Book sessions, rate tutors, and get academic help.',
    keywords: 'UCSB tutoring, UCSB tutor, academic tutoring, ECON 10A tutor, CHEM 109A tutor, PSTAT 8 tutor, MATH tutor, CMPSC tutor',
  },
  findTutors: {
    title: 'Find UCSB Tutors | Browse Expert Tutors for 220+ Courses',
    description: 'Browse and connect with verified UCSB tutors. Filter by course, rating, price, and availability. Get help with ECON, CHEM, PSTAT, MATH, and more.',
    keywords: 'find tutor, UCSB tutors, browse tutors, hire tutor, academic help',
  },
  becomeTutor: {
    title: 'Become a Tutor | Join UniTutor as a UCSB Tutor',
    description: 'Join UniTutor as a tutor and earn money by helping UCSB students. Set your own rates, schedule, and courses. Apply now to become a founding tutor.',
    keywords: 'become tutor, tutor jobs, UCSB tutor jobs, earn money tutoring, tutor application',
  },
  courses: {
    econ10a: {
      title: 'ECON 10A Tutors | Intermediate Microeconomic Theory Help',
      description: 'Find expert ECON 10A tutors at UCSB. Get help with intermediate microeconomic theory, problem sets, and exam preparation.',
      keywords: 'ECON 10A tutor, microeconomics tutor, UCSB economics help',
    },
    chem109a: {
      title: 'CHEM 109A Tutors | Organic Chemistry Help at UCSB',
      description: 'Connect with CHEM 109A tutors for organic chemistry help. Expert tutors for reactions, mechanisms, and exam prep.',
      keywords: 'CHEM 109A tutor, organic chemistry tutor, UCSB chemistry help',
    },
    pstat8: {
      title: 'PSTAT 8 Tutors | Data Science & Probability Statistics Help',
      description: 'Find PSTAT 8 tutors for transition to data science, probability and statistics. Get help with R, statistical concepts, and projects.',
      keywords: 'PSTAT 8 tutor, data science tutor, statistics tutor, UCSB PSTAT help',
    },
  },
};
