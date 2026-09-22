import { Fraunces, Inter } from 'next/font/google';
import './globals.css';
import Header, { Preloader, ScrollProgress, FloatingCTA, OfflineBanner } from '../components/chrome.jsx';
import Footer from '../components/footer.jsx';
import { ToastProvider } from '../components/ui.jsx';
import { cookies } from 'next/headers';
import { userFromToken, SESSION_COOKIE } from '../lib/auth.js';
import { SCHOOL } from '../lib/content.js';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['500', '600', '700'], style: ['normal', 'italic'], variable: '--ff-display', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--ff-body', display: 'swap' });

export const metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'https://bmgrammar.example'),
  title: {
    default: 'BM Grammar School — Montessori to Matric | Karachi',
    template: '%s | BM Grammar School Karachi',
  },
  description:
    'BM Grammar School, Karachi — Montessori to Matric education with separate boys\u2019 and girls\u2019 classes, qualified teachers, monthly Open Houses and free admission. Campuses in Al Sadaf Colony, Mominabad and Orangi Town.',
  icons: { icon: '/assets/brand/logo.jpg' },
  openGraph: {
    siteName: 'BM Grammar School',
    title: 'BM Grammar School — Montessori to Matric | Karachi',
    description: 'We Give A New Vision To Your Thoughts. Free admission, three campuses in Orangi Town, Karachi.',
    images: [{ url: '/assets/brand/logo.jpg', alt: 'BM Grammar School emblem' }],
    type: 'website',
  },
  twitter: { card: 'summary', title: 'BM Grammar School Karachi', description: 'Montessori to Matric · Karachi' },
};

export default async function RootLayout({ children }) {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const user = await userFromToken(token) || null;
  const org = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: SCHOOL.name,
    alternateName: SCHOOL.legalName,
    slogan: SCHOOL.tagline,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Plot No. 518, Sector No. 4/F, Islam Nagar, Orangi Town',
      addressLocality: 'Karachi',
      addressRegion: 'Sindh',
      addressCountry: 'PK',
    },
    telephone: SCHOOL.phoneIntl,
    email: SCHOOL.email,
    sameAs: SCHOOL.social.map((s) => s.url),
  };
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      </head>
      <body style={{ fontFamily: 'var(--ff-body)', ['--font-display']: 'var(--ff-display)', ['--font-body']: 'var(--ff-body)' }}>
        <noscript><style>{'.reveal{opacity:1;transform:none}'}</style></noscript>
        <ToastProvider>
          <Preloader />
          <ScrollProgress />
          <OfflineBanner />
          <Header user={user} />
          <main id="main">{children}</main>
          <Footer />
          <FloatingCTA />
        </ToastProvider>
      </body>
    </html>
  );
}
