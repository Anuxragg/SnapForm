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
  name: string;
  category: 'contact' | 'payment' | 'survey' | 'booking';
  description: string;
  fields: ISeedFormField[];
  styling: ISeedFormStyling;
}

export const PREDEFINED_TEMPLATES: ISeedFormTemplate[] = [
  {
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
      primaryColor: '#6366f1', // Indigo
    },
  },
  {
    name: 'Payment Integration Form',
    category: 'payment',
    description: 'Secure product billing and subscription payment form setup.',
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
        label: 'Email Address',
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
        label: 'Billing Zip Code',
        placeholder: '10001',
        required: true,
        validation: { minLength: 5, maxLength: 5 },
      },
    ],
    styling: {
      theme: 'minimal',
      primaryColor: '#10b981', // Emerald
    },
  },
  {
    name: 'Customer Feedback Survey',
    category: 'survey',
    description: 'Gather user sentiment, feature requests, and satisfaction levels.',
    fields: [
      {
        id: 'satisfactionLevel',
        type: 'radio',
        label: 'How satisfied are you with our product?',
        required: true,
        options: ['Extremely Satisfied', 'Very Satisfied', 'Neutral', 'Dissatisfied'],
      },
      {
        id: 'favoriteFeatures',
        type: 'checkbox',
        label: 'Which features do you use the most? (Select all that apply)',
        required: false,
        options: ['Visual Form Preview', 'Dynamic Code Generator', 'Styling Customizer', 'Instant ZIP Downloader'],
      },
      {
        id: 'referralLikelihood',
        type: 'select',
        label: 'How likely are you to recommend us to a colleague?',
        required: true,
        options: ['10/10 - Extremely Likely', '8-9 - Very Likely', '5-7 - Moderately Likely', '1-4 - Unlikely'],
      },
      {
        id: 'additionalFeedback',
        type: 'textarea',
        label: 'Do you have any suggestions or comments?',
        placeholder: 'We would love to hear your thoughts...',
        required: false,
        validation: { maxLength: 500 },
      },
    ],
    styling: {
      theme: 'corporate',
      primaryColor: '#0f172a', // Slate/Charcoal
    },
  },
  {
    name: 'Service Booking Form',
    category: 'booking',
    description: 'Book consultation slots, custom requests, and calendar slots.',
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
        placeholder: '2026-06-15',
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
        id: 'specialRequest',
        type: 'textarea',
        label: 'Special Requests / Notes',
        placeholder: 'Describe any specific requirements you have...',
        required: false,
      },
    ],
    styling: {
      theme: 'modern',
      primaryColor: '#ec4899', // Pink
    },
  },
];
