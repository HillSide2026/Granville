import { granville } from './granville';

export const homepage = {
  navigation: {
    links: [
      { text: 'Platform', href: '/#platform' },
      { text: 'Payments', href: '/#payments' },
      { text: 'Contact', href: '/#contact' },
    ],
    primaryAction: {
      text: 'Sign up',
      href: granville.appSignUpUrl,
      target: '_blank',
    },
  },
  hero: {
    tagline: 'Global Payments',
    title: 'One Platform. Global Money Movement.',
    subtitle:
      'Granville Finance provides financial infrastructure and payment technology to help businesses move, manage, and grow.',
    primaryAction: {
      text: 'Sign up',
      href: granville.appSignUpUrl,
      target: '_blank',
    },
    secondaryAction: {
      text: 'Discover Platform',
      href: '/#platform',
    },
    highlights: [],
  },
  products: {
    tagline: 'Platform',
    title: 'Powerful Platform Built for Modern Money Movement.',
    subtitle: '',
    items: [
      {
        title: 'Treasury Platform',
        description: 'A simple, scalable platform for routing payments, managing accounts, and currency conversion.',
        icon: 'tabler:route',
      },
      {
        title: 'Operational Visibility',
        description: 'A unified operational layer for monitoring payments, tracking providers, and reconciling execution.',
        icon: 'tabler:chart-dots-3',
      },
      {
        title: 'User Security',
        description:
          'Secure authentication, account protection, and controlled access designed for modern financial operations.',
        icon: 'tabler:building-bank',
      },
    ],
  },
  operatingModel: {
    tagline: 'REVOLUTIONISE PAYMENTS',
    title: 'Optimize Your Infrastructure for Corporate Money Movement.',
    subtitle:
      'Granville Finance helps global corporates optimize payments, currencies, and financial workflows across markets without relying on fragmented banking infrastructure.',
    contentTitle: 'GAME-CHANGING OPPORTUNITIES',
    contentBody:
      'Modernize global payments with infrastructure built for scale, visibility, and control. Granville Finance helps corporates streamline treasury and support international growth through unified financial infrastructure.',
    items: [
      {
        title: 'Optimize Payment Operations',
        description:
          'Consolidate fragmented payment rails, team processes, and provider workflows into a single operational platform designed for scale, visibility, and control.',
      },
      {
        title: 'Simplify Financial Workflows',
        description:
          'Unify currencies, approvals, reconciliation, and reporting into standardized workflows that reduce manual intervention and improve operational consistency across markets.',
      },
      {
        title: 'Improve Operational Visibility',
        description:
          'Gain real-time visibility into transaction flows, settlement status, reconciliation outcomes, and operational performance through centralized monitoring and reporting infrastructure.',
      },
    ],
  },
  company: {
    title: 'Company',
    items: [
      {
        title: 'Careers',
        description:
          'Build the future of worldwide money movement. Grow with Granville Finance as we expand our financial infrastructure and payment technology platform.',
        icon: 'tabler:briefcase',
      },
      {
        title: 'News',
        description:
          'Follow product launches and company updates. A simple home for announcements, market notes, and platform milestones as Granville Finance grows.',
        icon: 'tabler:news',
      },
    ],
  },
  closing: {
    tagline: 'CONTACT',
    title: 'Build modern global payment operations.',
    subtitle:
      'Speak with Granville Finance about how we can help your treasury team move forward with confidence.',
    primaryAction: {
      text: 'Sign Up',
      href: granville.appSignUpUrl,
      target: '_blank',
    },
    secondaryAction: {
      text: 'Contact Us',
      href: '/contact',
    },
  },
} as const;
