import mongoose from 'mongoose';
import { User, Profile, Course, CourseMaterial, Publication, Conference } from '@shared/schema';
import { hashPassword } from './utils';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

console.log('[MongoDB] Connecting to database...');

mongoose.connect(process.env.MONGODB_URI);

const dbMongo = mongoose.connection;

dbMongo.on('error', (err) => {
  console.error('[MongoDB] Connection error:', err);
});

dbMongo.once('open', async () => {
  console.log('[MongoDB] Connected successfully');

  try {
    // Create admin user if none exists
    const adminExists = await UserModel.exists({ isAdmin: true });
    if (!adminExists) {
      const hashedPassword = await hashPassword('admin123');
      await UserModel.create({
        username: 'admin',
        password: hashedPassword,
        isAdmin: true
      });
      console.log('[MongoDB] Created admin user');
    }

    // Create initial profile if none exists
    const profileExists = await ProfileModel.exists({});
    if (!profileExists) {
      await ProfileModel.create({
        name: 'Olawanle Patrick Layeni',
        title: 'Professor of Mathematics',
        bio: 'Specializing in solid mechanics and continuum mechanics',
        photoUrl: 'https://placekitten.com/200/200', // Placeholder image
        contactInfo: {
          email: 'layeni@example.com',
          office: 'Mathematics Department, Room 101',
          phone: '+1234567890'
        }
      });
      console.log('[MongoDB] Created initial profile');
    }

    // Add sample publication if none exist
    const publicationsExist = await PublicationModel.exists({});
    if (!publicationsExist) {
      await PublicationModel.create({
        title: 'Introduction to Continuum Mechanics',
        authors: 'Layeni, O.P.',
        journal: 'Journal of Mathematical Physics',
        year: 2024,
        doi: '10.1000/example',
        abstract: 'A comprehensive introduction to the principles of continuum mechanics.'
      });
      console.log('[MongoDB] Created sample publication');
    }

    // Add sample course if none exist
    const coursesExist = await CourseModel.exists({});
    if (!coursesExist) {
      await CourseModel.create({
        title: 'Advanced Calculus',
        code: 'MATH401',
        description: 'In-depth study of calculus concepts including limits, derivatives, and integrals.',
        semester: 'Spring 2024'
      });
      console.log('[MongoDB] Created sample course');
    }

    // Add sample conference if none exist
    const conferencesExist = await ConferenceModel.exists({});
    if (!conferencesExist) {
      await ConferenceModel.create({
        title: 'International Conference on Mathematical Physics',
        venue: 'Virtual Conference',
        date: new Date('2024-12-01'),
        description: 'Annual conference bringing together researchers in mathematical physics.',
        type: 'conference'
      });
      console.log('[MongoDB] Created sample conference');
    }
  } catch (err) {
    console.error('[MongoDB] Error creating initial data:', err);
  }
});

dbMongo.on('disconnected', () => {
  console.log('[MongoDB] Disconnected from database');
});

// User Model
const userSchema = new mongoose.Schema<User>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }
});

// Profile Model
const profileSchema = new mongoose.Schema<Profile>({
  name: { type: String, required: true },
  title: { type: String, required: true },
  bio: { type: String, required: true },
  photoUrl: { type: String, required: true },
  contactInfo: {
    email: { type: String, required: true },
    phone: String,
    office: String
  }
});

// Course Model
const courseSchema = new mongoose.Schema<Course>({
  title: { type: String, required: true },
  code: { type: String, required: true },
  description: { type: String, required: true },
  semester: { type: String, required: true }
});

// Course Material Model
const courseMaterialSchema = new mongoose.Schema<CourseMaterial>({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['slides', 'notes', 'assignment'], required: true },
  fileUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

// Publication Model
const publicationSchema = new mongoose.Schema<Publication>({
  title: { type: String, required: true },
  authors: { type: String, required: true },
  journal: { type: String, required: true },
  year: { type: Number, required: true },
  doi: String,
  abstract: String
});

// Conference Model
const conferenceSchema = new mongoose.Schema<Conference>({
  title: { type: String, required: true },
  venue: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['talk', 'conference', 'workshop'], required: true }
});

// Add timestamps to all models
[userSchema, profileSchema, courseSchema, courseMaterialSchema, publicationSchema, conferenceSchema].forEach(schema => {
  schema.set('timestamps', true);
  schema.set('toObject', {
    transform: function(doc, ret) {
      ret._id = ret._id.toString();
      return ret;
    }
  });
});

export const UserModel = mongoose.model<User>('User', userSchema);
export const ProfileModel = mongoose.model<Profile>('Profile', profileSchema);
export const CourseModel = mongoose.model<Course>('Course', courseSchema);
export const CourseMaterialModel = mongoose.model<CourseMaterial>('CourseMaterial', courseMaterialSchema);
export const PublicationModel = mongoose.model<Publication>('Publication', publicationSchema);
export const ConferenceModel = mongoose.model<Conference>('Conference', conferenceSchema);