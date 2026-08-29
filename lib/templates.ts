export interface ISeedFormField {
  id: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  options?: string[];
}

export interface ISeedFormStyling {
  theme: 'minimal' | 'modern' | 'corporate';
  primaryColor: string;
}

export interface ISeedFormTemplate {
  id?: string;
  _id?: string;
  shortId?: string;
  name: string;
  category: 'contact' | 'payment' | 'survey' | 'booking' | 'registration' | 'feedback' | 'application' | string;
  description: string;
  fields: ISeedFormField[];
  styling: ISeedFormStyling;
  userId?: string;
}

export const PREDEFINED_TEMPLATES: ISeedFormTemplate[] = [
  // 1. Contact Inquiry Form
  {
    id: 'contact-starter',
    name: 'Contact Inquiry Form',
    category: 'contact',
    description: 'Get in touch with your clients with a standard contact inquiry form.',
    fields: [
      {
        id: 'fullName',
        type: 'text',
        label: 'Full Name',
        placeholder: 'John Doe',
        required: true,
        validation: { minLength: 2, maxLength: 50 },
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        placeholder: 'john.doe@example.com',
        required: true,
      },
      {
        id: 'subject',
        type: 'text',
        label: 'Subject',
        placeholder: 'How can we help you?',
        required: true,
        validation: { minLength: 5 },
      },
      {
        id: 'message',
        type: 'textarea',
        label: 'Message',
        placeholder: 'Describe your inquiry in detail...',
        required: true,
        validation: { minLength: 10 },
      },
    ],
    styling: {
      theme: 'modern',
      primaryColor: '#ff4f19',
    },
  },

  // 2. B2B Sales & Lead Qualification Form
  {
    id: 'b2b-lead-generation',
    name: 'B2B Lead Qualification',
    category: 'contact',
    description: 'Capture high-value inbound sales leads, company size, and budget readiness.',
    fields: [
      {
        id: 'contactName',
        type: 'text',
        label: 'Full Name',
        placeholder: 'Sarah Connor',
        required: true,
      },
      {
        id: 'workEmail',
        type: 'email',
        label: 'Work Email Address',
        placeholder: 'sarah@company.com',
        required: true,
      },
      {
        id: 'companyName',
        type: 'text',
        label: 'Company / Organization',
        placeholder: 'Acme Corp',
        required: true,
      },
      {
        id: 'companySize',
        type: 'select',
        label: 'Company Headcount',
        required: true,
        options: ['1-10 employees', '11-50 employees', '51-200 employees', '201-1000 employees', '1000+ Enterprise'],
      },
      {
        id: 'budgetRange',
        type: 'radio',
        label: 'Estimated Annual Budget',
        required: true,
        options: ['Under $5,000', '$5,000 - $20,000', '$20,000 - $50,000', '$50,000+'],
      },
      {
        id: 'goals',
        type: 'textarea',
        label: 'What is your primary project goal?',
        placeholder: 'Tell us what you are looking to achieve...',
        required: false,
      },
    ],
    styling: {
      theme: 'corporate',
      primaryColor: '#2563eb',
    },
  },

  // 3. Customer Support & Bug Ticket
  {
    id: 'support-ticket',
    name: 'Customer Support & Bug Ticket',
    category: 'contact',
    description: 'Helpdesk intake form with urgency classification and issue logs.',
    fields: [
      {
        id: 'requesterName',
        type: 'text',
        label: 'Your Name',
        placeholder: 'Alex Rivera',
        required: true,
      },
      {
        id: 'accountEmail',
        type: 'email',
        label: 'Account Email',
        placeholder: 'alex@example.com',
        required: true,
      },
      {
        id: 'issueType',
        type: 'select',
        label: 'Issue Category',
        required: true,
        options: ['Account & Login', 'Billing & Invoices', 'Bug or Glitch', 'Feature Request', 'Other'],
      },
      {
        id: 'urgency',
        type: 'radio',
        label: 'Urgency Level',
        required: true,
        options: ['Low - General Question', 'Medium - Minor Impairment', 'High - Service Blocker'],
      },
      {
        id: 'issueDescription',
        type: 'textarea',
        label: 'Detailed Description of the Issue',
        placeholder: 'Please include steps to reproduce or expected behavior...',
        required: true,
      },
      {
        id: 'screenshot',
        type: 'file',
        label: 'Attach Screenshot or Error Log (Optional)',
        required: false,
      },
    ],
    styling: {
      theme: 'modern',
      primaryColor: '#dc2626',
    },
  },

  // 4. Payment & Checkout Setup
  {
    id: 'payment-starter',
    name: 'SaaS Subscription Checkout',
    category: 'payment',
    description: 'Secure product billing and subscription payment setup.',
    fields: [
      {
        id: 'cardholderName',
        type: 'text',
        label: 'Cardholder Name',
        placeholder: 'Jane Smith',
        required: true,
      },
      {
        id: 'email',
        type: 'email',
        label: 'Billing Email Address',
        placeholder: 'jane.smith@example.com',
        required: true,
      },
      {
        id: 'planSelection',
        type: 'select',
        label: 'Select Subscription Plan',
        required: true,
        options: ['Starter Plan ($19/mo)', 'Professional Plan ($49/mo)', 'Enterprise Plan ($99/mo)'],
      },
      {
        id: 'billingZipCode',
        type: 'text',
        label: 'Billing Postal / Zip Code',
        placeholder: '10001',
        required: true,
        validation: { minLength: 4, maxLength: 10 },
      },
      {
        id: 'termsAccepted',
        type: 'checkbox',
        label: 'I agree to the Terms of Service and Privacy Policy',
        placeholder: 'I accept automatic renewal terms and recurring billing',
        required: true,
      },
    ],
    styling: {
      theme: 'minimal',
      primaryColor: '#10b981',
    },
  },

  // 5. Non-Profit Donation Form
  {
    id: 'donation-form',
    name: 'Non-Profit Charity Donation',
    category: 'payment',
    description: 'Collect charitable contributions with preset tier amounts and donor notes.',
    fields: [
      {
        id: 'donorName',
        type: 'text',
        label: 'Donor Full Name',
        placeholder: 'David Miller',
        required: true,
      },
      {
        id: 'donorEmail',
        type: 'email',
        label: 'Email Address for Tax Receipt',
        placeholder: 'david@example.com',
        required: true,
      },
      {
        id: 'donationAmount',
        type: 'radio',
        label: 'Select Donation Tier',
        required: true,
        options: ['$25 - Bronze Supporter', '$50 - Silver Supporter', '$100 - Gold Champion', '$250+ Benefactor'],
      },
      {
        id: 'isRecurring',
        type: 'checkbox',
        label: 'Make this a monthly recurring donation',
        placeholder: 'Yes, donate this amount every month automatically',
        required: false,
      },
      {
        id: 'dedicationMessage',
        type: 'textarea',
        label: 'Dedication or Tribute Note (Optional)',
        placeholder: 'In honor of...',
        required: false,
      },
    ],
    styling: {
      theme: 'modern',
      primaryColor: '#059669',
    },
  },

  // 6. Customer Feedback Survey
  {
    id: 'survey-starter',
    name: 'Customer Satisfaction Survey (CSAT)',
    category: 'survey',
    description: 'Gather user sentiment, feature requests, and net promoter score (NPS).',
    fields: [
      {
        id: 'satisfactionLevel',
        type: 'radio',
        label: 'Overall, how satisfied are you with our product?',
        required: true,
        options: ['Extremely Satisfied', 'Very Satisfied', 'Neutral', 'Dissatisfied'],
      },
      {
        id: 'referralLikelihood',
        type: 'select',
        label: 'How likely are you to recommend us to a colleague?',
        required: true,
        options: ['10/10 - Extremely Likely', '8-9 - Very Likely', '5-7 - Moderately Likely', '1-4 - Unlikely'],
      },
      {
        id: 'favoriteFeatures',
        type: 'checkbox',
        label: 'Which features do you find most valuable?',
        placeholder: 'Select core highlights you interact with most',
        required: false,
      },
      {
        id: 'additionalFeedback',
        type: 'textarea',
        label: 'What could we improve to make your experience better?',
        placeholder: 'We would love to hear your direct feedback...',
        required: false,
        validation: { maxLength: 500 },
      },
    ],
    styling: {
      theme: 'modern',
      primaryColor: '#ff4f19',
    },
  },

  // 7. Product Feature Request
  {
    id: 'feature-request',
    name: 'Product Feature Request',
    category: 'feedback',
    description: 'Collect user feedback, suggestions, and customer product roadmap priorities.',
    fields: [
      {
        id: 'featureTitle',
        type: 'text',
        label: 'Feature or Enhancement Title',
        placeholder: 'e.g. Export to Notion or Figma plugin',
        required: true,
      },
      {
        id: 'productArea',
        type: 'select',
        label: 'Module / Area of Product',
        required: true,
        options: ['Visual Editor', 'Code Generation', 'Submissions & Database', 'Analytics', 'Integrations & Webhooks'],
      },
      {
        id: 'importance',
        type: 'radio',
        label: 'How critical is this for your workflow?',
        required: true,
        options: ['Nice to have', 'Important - Saves Time', 'Critical - Deal Breaker'],
      },
      {
        id: 'useCaseDescription',
        type: 'textarea',
        label: 'Describe your use case in detail',
        placeholder: 'Explain why this feature would help you and how you would use it...',
        required: true,
      },
      {
        id: 'betaTesting',
        type: 'checkbox',
        label: 'I would like to beta test this feature when available',
        placeholder: 'Contact me when a preview or beta build is ready',
        required: false,
      },
    ],
    styling: {
      theme: 'minimal',
      primaryColor: '#8b5cf6',
    },
  },

  // 8. Event & Webinar Registration
  {
    id: 'webinar-registration',
    name: 'Webinar & Event Registration',
    category: 'registration',
    description: 'Event RSVP form with attendee info, session track selection, and reminders.',
    fields: [
      {
        id: 'attendeeName',
        type: 'text',
        label: 'Full Name',
        placeholder: 'Michael Chen',
        required: true,
      },
      {
        id: 'attendeeEmail',
        type: 'email',
        label: 'Email Address for Event Link',
        placeholder: 'michael@example.com',
        required: true,
      },
      {
        id: 'jobTitle',
        type: 'text',
        label: 'Job Title / Role',
        placeholder: 'Lead Product Engineer',
        required: true,
      },
      {
        id: 'sessionTrack',
        type: 'select',
        label: 'Preferred Breakout Track',
        required: true,
        options: ['Track A: Frontend Architecture with Next.js', 'Track B: AI Prompt Engineering & LLM Compilers', 'Track C: Enterprise Cloud Scaling'],
      },
      {
        id: 'calendarInvite',
        type: 'checkbox',
        label: 'Send calendar invite (.ics) and 1-hour email reminder',
        placeholder: 'Yes, keep me notified with session calendar invites',
        required: true,
      },
    ],
    styling: {
      theme: 'corporate',
      primaryColor: '#0284c7',
    },
  },

  // 9. Job & Career Application
  {
    id: 'job-application',
    name: 'Job Application & Candidate Intake',
    category: 'application',
    description: 'Candidate screening form with role selection, LinkedIn portfolio, and resume file upload.',
    fields: [
      {
        id: 'candidateName',
        type: 'text',
        label: 'Full Legal Name',
        placeholder: 'Emily Watson',
        required: true,
      },
      {
        id: 'candidateEmail',
        type: 'email',
        label: 'Email Address',
        placeholder: 'emily@example.com',
        required: true,
      },
      {
        id: 'targetRole',
        type: 'select',
        label: 'Applying For Role',
        required: true,
        options: ['Full Stack Engineer (Next.js/Node)', 'Senior Product Designer (UI/UX)', 'Developer Relations Advocate', 'Technical Product Manager'],
      },
      {
        id: 'portfolioUrl',
        type: 'text',
        label: 'Portfolio / GitHub / LinkedIn URL',
        placeholder: 'https://github.com/username',
        required: true,
      },
      {
        id: 'resumeFile',
        type: 'file',
        label: 'Upload Resume / CV (PDF or DOCX)',
        required: true,
      },
      {
        id: 'coverLetter',
        type: 'textarea',
        label: 'Why do you want to join our team?',
        placeholder: 'Tell us a bit about your past achievements and what excites you...',
        required: false,
      },
    ],
    styling: {
      theme: 'modern',
      primaryColor: '#4f46e5',
    },
  },

  // 10. Consultation & Service Booking
  {
    id: 'booking-starter',
    name: 'Service Consultation Booking',
    category: 'booking',
    description: 'Book consultation appointments, custom requests, and calendar slots.',
    fields: [
      {
        id: 'clientName',
        type: 'text',
        label: 'Your Name',
        placeholder: 'Alex Jones',
        required: true,
      },
      {
        id: 'contactEmail',
        type: 'email',
        label: 'Email Address',
        placeholder: 'alex@example.com',
        required: true,
      },
      {
        id: 'consultationDate',
        type: 'text',
        label: 'Preferred Date (YYYY-MM-DD)',
        placeholder: '2026-09-15',
        required: true,
        validation: { pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
      },
      {
        id: 'consultationTime',
        type: 'select',
        label: 'Preferred Time Slot',
        required: true,
        options: [
          '09:00 AM - 11:00 AM',
          '11:00 AM - 01:00 PM',
          '02:00 PM - 04:00 PM',
          '04:00 PM - 06:00 PM',
        ],
      },
      {
        id: 'meetingFormat',
        type: 'radio',
        label: 'Preferred Meeting Channel',
        required: true,
        options: ['Google Meet Video Call', 'Zoom Meeting', 'Phone Call'],
      },
      {
        id: 'specialRequest',
        type: 'textarea',
        label: 'Special Requests / Notes',
        placeholder: 'Describe any specific requirements or goals you have...',
        required: false,
      },
    ],
    styling: {
      theme: 'minimal',
      primaryColor: '#ec4899',
    },
  },
];
