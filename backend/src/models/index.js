const mongoose = require('mongoose');
const { Schema } = mongoose;

const localized = { en: String, ar: String };

const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, index: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  kycStatus: { type: String, enum: ['pending', 'submitted', 'approved', 'rejected'], default: 'pending' },
  avatar: String,
  idDocumentType: String,
  idDocumentLabel: String,
  idDocumentCountry: String,
  idDocumentUrl: String,
  idDocumentSource: { type: String, enum: ['upload', 'camera', ''], default: '' },
}, { timestamps: true });

const OtpSchema = new Schema({
  phone: { type: String, required: true, index: true },
  code: { type: String, required: true }, // stored as HMAC hash
  purpose: { type: String, enum: ['login', 'signup', 'reset'], default: 'login' },
  payload: { type: Schema.Types.Mixed },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

const ApplicationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  name: String,
  email: String,
  phone: String,
  service: String,
  message: String,
  status: { type: String, enum: ['pending', 'in_review', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

const DocumentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  title: String,
  url: String,
  type: String,
  sharedByAdmin: { type: Boolean, default: false },
}, { timestamps: true });

const NewsSchema = new Schema({
  title: localized,
  slug: { type: String, unique: true },
  excerpt: localized,
  content: localized,
  image: String,
  category: String,
  author: String,
}, { timestamps: true });

const BlogSchema = new Schema({
  title: localized, slug: { type: String, unique: true }, excerpt: localized,
  content: localized, image: String, author: String,
}, { timestamps: true });

const ContactSchema = new Schema({
  name: String, email: String, subject: String, message: String,
  status: { type: String, default: 'new' },
}, { timestamps: true });

const NewsletterSchema = new Schema({ email: { type: String, unique: true } }, { timestamps: true });

const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  title: String, body: String, read: { type: Boolean, default: false },
}, { timestamps: true });

const AuditLogSchema = new Schema({
  actor: String, action: String, meta: Object,
}, { timestamps: true });

module.exports = {
  User: mongoose.model('User', UserSchema),
  Otp: mongoose.model('Otp', OtpSchema),
  Application: mongoose.model('Application', ApplicationSchema),
  Document: mongoose.model('Document', DocumentSchema),
  News: mongoose.model('News', NewsSchema),
  Blog: mongoose.model('Blog', BlogSchema),
  Contact: mongoose.model('Contact', ContactSchema),
  Newsletter: mongoose.model('Newsletter', NewsletterSchema),
  Notification: mongoose.model('Notification', NotificationSchema),
  AuditLog: mongoose.model('AuditLog', AuditLogSchema),
};
