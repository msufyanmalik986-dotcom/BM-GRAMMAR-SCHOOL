/**
 * BM Grammar School — relational data layer (SQLite via better-sqlite3).
 * Runs schema migrations on first load and seeds verified public content only.
 */
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const dbPath = (process.env.DATABASE_URL || 'file:./data/bmgs.db').replace(/^file:/, '');
const db = new Database(path.resolve(process.cwd(), dbPath));
db.pragma('journal_mode = WAL');

/* ---------------- Migrations ---------------- */
db.exec(`
CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'USER',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS password_resets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS branches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  address TEXT,
  phone TEXT,
  latitude REAL, longitude REAL,
  map_query TEXT,
  description TEXT,
  image TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS admission_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  idempotency_key TEXT UNIQUE,
  reference_number TEXT NOT NULL UNIQUE,
  student_name TEXT NOT NULL,
  date_of_birth TEXT,
  gender TEXT,
  previous_school TEXT,
  previous_class TEXT,
  applying_class TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  relationship TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  campus_id INTEGER NOT NULL REFERENCES branches(id),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_app_user ON admission_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_app_campus ON admission_applications(campus_id);
CREATE INDEX IF NOT EXISTS idx_app_status ON admission_applications(status);
CREATE INDEX IF NOT EXISTS idx_app_ref ON admission_applications(reference_number);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  date_label TEXT,
  date_value TEXT,
  location TEXT,
  category TEXT,
  image TEXT,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE TABLE IF NOT EXISTS gallery_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  caption TEXT,
  alt_text TEXT NOT NULL,
  representative INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS notices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  category TEXT,
  published INTEGER NOT NULL DEFAULT 1,
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notices_slug ON notices(slug);
CREATE TABLE IF NOT EXISTS faculty (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  position TEXT,
  qualification TEXT,
  subject TEXT,
  photo TEXT,
  bio TEXT,
  published INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  published INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

/* ---------------- Seed: verified public information only ---------------- */
const seeded = db.prepare('SELECT COUNT(*) AS c FROM branches').get().c;
if (seeded === 0) {
  const insBranch = db.prepare(`INSERT INTO branches (name, slug, address, phone, map_query, description) VALUES (?,?,?,?,?,?)`);
  insBranch.run(
    'Orangi Town Campus', 'orangi-town',
    'Plot No. 518, Sector No. 4/F, Islam Nagar, Orangi Town, Karachi',
    '0312-2690757',
    'BM Grammar School, Plot No. 518, Sector 4/F, Islam Nagar, Orangi Town, Karachi',
    'The documented head campus of BM Grammar School, located in Islam Nagar, Orangi Town, Karachi.'
  );
  insBranch.run(
    'Al Sadaf Colony Campus', 'al-sadaf-colony',
    null,
    '0312-2690757',
    'BM Grammar School, Al Sadaf Colony, Orangi Town, Karachi',
    'The Al Sadaf Colony campus serves families across the colony and neighbouring blocks of Orangi Town. The precise street address is maintained on the school office record and can be confirmed by phone.'
  );
  insBranch.run(
    'Mominabad Campus', 'mominabad',
    null,
    '0312-2690757',
    'BM Grammar School, Mominabad, Karachi',
    'The Mominabad campus extends the school\u2019s Montessori-to-Matric programme to families in Mominabad. The precise street address is maintained on the school office record and can be confirmed by phone.'
  );

  const insEvent = db.prepare(`INSERT INTO events (title, slug, description, date_label, date_value, location, category, image) VALUES (?,?,?,?,?,?,?,?)`);
  insEvent.run(
    'Grand Open House',
    'grand-open-house-ali-baba-stadium',
    'BM Grammar School hosts a large Open House gathering at Ali Baba Stadium, Orangi Town No. 4, where families can meet the school\u2019s leadership, learn about the Montessori-to-Matric programme, and see student work on display. The school office announces the schedule on its official channels. Families are warmly welcome to attend.',
    'Date announced by the school office', null,
    'Ali Baba Stadium, Orangi Town No. 4, Karachi',
    'Open House', '/assets/img/sports-ground.jpg'
  );
  insEvent.run(
    'Monthly Open House',
    'monthly-open-house',
    'Every month the school opens its doors to parents and guardians. The Monthly Open House is a standing opportunity to review a child\u2019s progress, meet class teachers, and discuss upcoming academic milestones with the school\u2019s administration. Contact your campus for this month\u2019s date.',
    'Held monthly \u2014 dates from the campus office', null,
    'All BM Grammar School campuses',
    'Open House', '/assets/img/library-reading.jpg'
  );

  const insGallery = db.prepare(`INSERT INTO gallery_images (title, image_url, category, caption, alt_text, representative) VALUES (?,?,?,?,?,1)`);
  insGallery.run('A bright, attentive classroom', '/assets/img/hero-classroom.jpg', 'Classrooms', 'Representational image of a welcoming classroom environment.', 'A teacher standing with a group of uniformed schoolchildren in a bright classroom');
  insGallery.run('Reading together in the library', '/assets/img/library-reading.jpg', 'Learning', 'Representational image of guided reading.', 'A teacher reading a book with a circle of children on a library floor');
  insGallery.run('Early learning, hands-on', '/assets/img/montessori-learning.jpg', 'Students', 'Representational image of early-years number work.', 'A young child arranging wooden number cards on a floor mat');
  insGallery.run('Science inquiry', '/assets/img/science-lab.jpg', 'Activities', 'Representational image of practical science work.', 'Schoolchildren using microscopes during a science lesson');
  insGallery.run('At the board', '/assets/img/secondary-blackboard.jpg', 'Classrooms', 'Representational image of secondary-level classwork.', 'A secondary student writing at a chalkboard while a teacher looks on');
  insGallery.run('Examination discipline', '/assets/img/matric-exam.jpg', 'Learning', 'Representational image of focused assessment.', 'Close view of students\u2019 hands writing in examination notebooks');
  insGallery.run('Games and sports period', '/assets/img/sports-ground.jpg', 'Activities', 'Representational image of outdoor games.', 'Schoolchildren playing football on a school playground with a teacher');
  insGallery.run('A professional teaching environment', '/assets/img/teacher-classroom.jpg', 'Campus', 'Representational image of a prepared classroom.', 'A teacher standing beside a desk in front of a classroom board');

  const insFaculty = db.prepare(`INSERT INTO faculty (name, position, qualification, subject, bio, published) VALUES (?,?,?,?,?,1)`);
  insFaculty.run(
    'Shakeel Ahmed Bhatti', 'Principal', null, null,
    'Shakeel Ahmed Bhatti leads BM Grammar School as its Principal, overseeing the school\u2019s campuses and its Montessori-to-Matric programme. A full biography will be published by the school office.'
  );

  const insFaq = db.prepare(`INSERT INTO faqs (question, answer, category, sort_order) VALUES (?,?,?,?)`);
  const faqs = [
    ['Which classes does BM Grammar School offer?', 'The school provides education from Montessori through Matric, covering early years, primary, middle and secondary levels, including Matriculation preparation.', 'Academics', 1],
    ['Are classes separate for boys and girls?', 'Yes. The school provides separate classes for boys and girls, with a positive and disciplined learning environment.', 'Academics', 2],
    ['Is there an admission fee?', 'Admission is free. Families can start an application online through this website or visit any campus office for assistance.', 'Admissions', 3],
    ['Where are the school\u2019s campuses located?', 'BM Grammar School serves families from three campuses: Al Sadaf Colony, Mominabad and Orangi Town, Karachi. The documented Orangi Town campus address is Plot No. 518, Sector No. 4/F, Islam Nagar, Orangi Town.', 'Campuses', 4],
    ['How do I apply for admission?', 'Choose \u201cApply Online\u201d, create a parent account, select a campus and class, complete the student and guardian details, and submit. You will receive a reference number such as BM-2026-XXXXXX to track the application from your dashboard.', 'Applications', 5],
    ['How can I track my admission application?', 'Sign in and open your dashboard. Every application shows its current status: Submitted, Under Review, Accepted or Rejected.', 'Applications', 6],
    ['What is the Monthly Open House?', 'The school holds a Monthly Open House where parents meet teachers and review student progress. A larger Open House event is also held at Ali Baba Stadium, Orangi Town No. 4. Dates are announced by the school office.', 'Events', 7],
    ['How can I contact the school?', 'Call the school office on 0312-2690757, write through the contact form on this website, or email bmgsone1@yahoo.com.', 'Contact', 8],
  ];
  faqs.forEach((f) => insFaq.run(...f));
}

/* ---------------- Query helpers ---------------- */
const q = {
  branches: () => db.prepare('SELECT * FROM branches WHERE active = 1 ORDER BY id').all(),
  branch: (slug) => db.prepare('SELECT * FROM branches WHERE slug = ?').get(slug),
  branchById: (id) => db.prepare('SELECT * FROM branches WHERE id = ?').get(id),
  events: () => db.prepare('SELECT * FROM events WHERE published = 1 ORDER BY id').all(),
  event: (slug) => db.prepare('SELECT * FROM events WHERE slug = ? AND published = 1').get(slug),
  gallery: () => db.prepare('SELECT * FROM gallery_images WHERE published = 1 ORDER BY id').all(),
  notices: () => db.prepare('SELECT * FROM notices WHERE published = 1 ORDER BY published_at DESC, id DESC').all(),
  notice: (slug) => db.prepare('SELECT * FROM notices WHERE slug = ? AND published = 1').get(slug),
  faculty: () => db.prepare('SELECT * FROM faculty WHERE published = 1 ORDER BY id').all(),
  faqs: () => db.prepare('SELECT * FROM faqs WHERE published = 1 ORDER BY sort_order, id').all(),
};

module.exports = { db, q };
