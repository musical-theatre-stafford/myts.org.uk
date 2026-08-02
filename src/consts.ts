/**
 * Site-wide constants. Change values here rather than hard-coding in components.
 * The Claude GitHub Action is instructed to edit this file when marketing
 * asks to change any of: site title, tagline, contact details, or social URLs.
 */
export const SITE = {
  title: 'Musical Youth Theatre Stafford',
  short: 'MYTS',
  tagline: 'Youth and experience in harmony',
  url: 'https://myts.org.uk',
} as const;

export const CONTACT = {
  emailEnquiries: 'enquiries@myts.org.uk',
  emailTickets: 'tickets@myts.org.uk',
  emailSafeguarding: 'safeguarding@myts.org.uk',
  phone: '07847 049 129',
} as const;

export const SOCIALS = {
  // Fill these in as they become known. Empty strings hide the icon.
  facebook: 'https://www.facebook.com/mytsStafford/',
  instagram: 'https://www.instagram.com/myts_stafford/',
  youtube: '',
  tiktok: 'https://www.tiktok.com/@myts_stafford',
} as const;

/**
 * Optional: a shows-page banner shown above the list. Set to empty string to hide.
 */
export const SHOWS_BANNER = '';
