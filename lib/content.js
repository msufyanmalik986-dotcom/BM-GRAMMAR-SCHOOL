/**
 * Centralized school content — verified public information only.
 * Anything unverified is expressed as an editable slot, never invented.
 * Sources: school's official public listings (Facebook pages), and information
 * provided by the school administration.
 */
const SCHOOL = {
  name: 'BM Grammar School',
  legalName: 'BM Grammar Secondary School',
  tagline: 'We Give A New Vision To Your Thoughts',
  headline: 'Building Strong Foundations. Shaping Brighter Futures.',
  city: 'Karachi',
  region: 'Sindh',
  country: 'Pakistan',
  phoneDisplay: '0312-2690757',
  phoneIntl: '+923122690757',
  email: 'bmgsone1@yahoo.com', // as published on the school's official public page
  principal: 'Shakeel Ahmed Bhatti',
  principalRole: 'Principal',
  programme: 'Montessori to Matric',
  admissionFree: true, // as stated by the school administration
  social: [
    { name: 'Facebook', label: 'B.M Grammar Sec. School', url: 'https://www.facebook.com/B.M.gsecschool/' },
    { name: 'Facebook', label: 'B.M Grammar School Al Sadaf Campus', url: 'https://www.facebook.com/bmgroupofschools/' },
    { name: 'YouTube', label: 'School channel', url: 'https://www.youtube.com/@ShakeelAhmed-fg3qz' },
  ],
  openHouseVenue: 'Ali Baba Stadium, Orangi Town No. 4, Karachi',
};

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/academics', label: 'Academics' },
  { href: '/admissions', label: 'Admissions' },
  { href: '/campus-life', label: 'Campus Life' },
  { href: '/faculty', label: 'Faculty' },
  { href: '/events', label: 'Events' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
];

const LEVELS = [
  {
    key: 'montessori', title: 'Montessori', ages: 'Early Years',
    image: '/assets/img/montessori-learning.jpg',
    alt: 'Representational image: a young child working with wooden number cards',
    blurb: 'A gentle, hands-on beginning. The early-years environment nurtures curiosity, fine-motor skills and confidence through activity-based learning.',
    focus: ['Activity-based early learning', 'Language and number readiness', 'Manners, confidence and independence'],
  },
  {
    key: 'primary', title: 'Primary', ages: 'Foundational Years',
    image: '/assets/img/hero-classroom.jpg',
    alt: 'Representational image: a teacher with a primary class in a bright classroom',
    blurb: 'Strong foundations in language, mathematics and general knowledge, built through structured classroom teaching and regular daily tasks.',
    focus: ['English, Urdu and Mathematics foundations', 'Daily classwork and home tasks', 'Reading habits and handwriting'],
  },
  {
    key: 'middle', title: 'Middle', ages: 'Intermediate Years',
    image: '/assets/img/science-lab.jpg',
    alt: 'Representational image: students at microscopes during a science lesson',
    blurb: 'Students move from foundations to inquiry — deepening subjects, practising scientific thinking and growing in written expression.',
    focus: ['Science, mathematics and languages', 'Conceptual understanding over rote learning', 'Discipline and study skills'],
  },
  {
    key: 'secondary', title: 'Secondary', ages: 'Advanced Years',
    image: '/assets/img/secondary-blackboard.jpg',
    alt: 'Representational image: a secondary student writing at a chalkboard',
    blurb: 'A focused stage that prepares students for board-level study, with structured lessons, board work and continuous assessment.',
    focus: ['Board-oriented subject teaching', 'Regular tests and revision cycles', 'Guidance and academic counselling'],
  },
  {
    key: 'matric', title: 'Matric', ages: 'Matriculation',
    image: '/assets/img/matric-exam.jpg',
    alt: 'Representational image: students writing examinations with focus',
    blurb: 'Complete Matriculation preparation with examination discipline, past-paper practice and teacher support through to board examinations.',
    focus: ['Complete board examination preparation', 'Past-paper practice and model answers', 'Examination discipline and time management'],
  },
];

const DAILY_FLOW = [
  { title: 'Learning', text: 'Concepts introduced clearly in class.' },
  { title: 'Task', text: 'Regular daily tasks reinforce the lesson.' },
  { title: 'Participation', text: 'Students take part, ask and answer.' },
  { title: 'Practice', text: 'Exercises, classwork and homework.' },
  { title: 'Progress', text: 'Reviewed with parents at Open House.' },
];

const CLASS_OPTIONS = ['Montessori', 'Preparatory', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

const mapSearchUrl = (query) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
const mapDirectionsUrl = (query) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;

module.exports = { SCHOOL, NAV, LEVELS, DAILY_FLOW, CLASS_OPTIONS, mapSearchUrl, mapDirectionsUrl };
