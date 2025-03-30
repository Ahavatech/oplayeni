import mongoose from 'mongoose';
import { User, Profile, Course, CourseMaterial, Publication, Conference } from '@shared/schema';
import { hashPassword } from './utils';
import { z } from "zod";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

console.log('[MongoDB] Connecting to database...');

// Define models first
const userSchema = new mongoose.Schema<User>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }
});

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

const courseSchema = new mongoose.Schema<Course>({
  title: { type: String, required: true },
  code: { type: String, required: true },
  description: { type: String, required: true },
  semester: { type: String, required: true }
});

const courseMaterialSchema = new mongoose.Schema<CourseMaterial>({
  courseId: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['notes', 'tutorial', 'assignment'], required: true },
  fileUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const publicationSchema = new mongoose.Schema<Publication>({
  title: { type: String, required: true },
  authors: { type: String, required: true },
  journal: { type: String, required: true },
  year: { type: Number, required: true },
  doi: String,
  abstract: String
});

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

// Create models
export const UserModel = mongoose.model<User>('User', userSchema);
export const ProfileModel = mongoose.model<Profile>('Profile', profileSchema);
export const CourseModel = mongoose.model<Course>('Course', courseSchema);
export const CourseMaterialModel = mongoose.model<CourseMaterial>('CourseMaterial', courseMaterialSchema);
export const PublicationModel = mongoose.model<Publication>('Publication', publicationSchema);
export const ConferenceModel = mongoose.model<Conference>('Conference', conferenceSchema);

export async function connectDB() {
  try {
    console.log("[MongoDB] Connecting to database...");
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10
    });
    console.log("[MongoDB] Connected successfully");

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
        photoUrl: 'https://placekitten.com/200/200',
        contactInfo: {
          email: 'layeni@example.com',
          office: 'Mathematics Department, Room 101',
          phone: '+1234567890'
        }
      });
      console.log('[MongoDB] Created initial profile');
    }

    // Add sample data
    await Promise.all([
      createSamplePublication(),
      createSampleCourse(),
      createSampleConference()
    ]);

  } catch (error) {
    console.error("[MongoDB] Connection error:", error);
    process.exit(1);
  }
}

async function createSamplePublication() {
  const exists = await PublicationModel.exists({});
  if (!exists) {
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
}

async function createSampleCourse() {
  const exists = await CourseModel.exists({});
  if (!exists) {
    await CourseModel.create({
      title: 'Advanced Calculus',
      code: 'MATH401',
      description: 'In-depth study of calculus concepts including limits, derivatives, and integrals.',
      semester: 'Spring 2024'
    });
    console.log('[MongoDB] Created sample course');
  }
}

async function createSampleConference() {
  const exists = await ConferenceModel.exists({});
  if (!exists) {
    await ConferenceModel.create({
      title: 'International Conference on Mathematical Physics',
      venue: 'Virtual Conference',
      date: new Date('2024-12-01'),
      description: 'Annual conference bringing together researchers in mathematical physics.',
      type: 'conference'
    });
    console.log('[MongoDB] Created sample conference');
  }
}

// Handle disconnection
mongoose.connection.on('disconnected', () => {
  console.log('[MongoDB] Disconnected from database');
});