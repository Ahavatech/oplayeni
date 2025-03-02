import mongoose from 'mongoose';
import { User, Profile, Course, CourseMaterial, Publication, Conference } from '@shared/schema';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

console.log('[MongoDB] Connecting to database...');

mongoose.connect(process.env.MONGODB_URI);

const dbMongo = mongoose.connection;

dbMongo.on('error', (err) => {
  console.error('[MongoDB] Connection error:', err);
});

dbMongo.once('open', () => {
  console.log('[MongoDB] Connected successfully');
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