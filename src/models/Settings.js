import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    instagramLink: {
      type: String,
      default: '',
    },
    telegramLink: {
      type: String,
      default: '',
    },
    appName: {
      type: String,
      default: 'Wingo Tool',
    },
    appDownloadLink: {
      type: String,
      default: '#',
    },
    appLogoUrl: {
      type: String,
      default: 'https://cdn.nexapk.in/image34.webp',
    },
    appVersion: {
      type: String,
      default: 'v1.0.2',
    },
    appSize: {
      type: String,
      default: '12.5 MB',
    },
    upiId: {
      type: String,
      default: 'sailent@upi',
    },
    upiName: {
      type: String,
      default: 'Wingo Tool',
    },
    upiAmount: {
      type: Number,
      default: 499,
    },
    noticeText: {
      type: String,
      default: 'Welcome to Wingo Tool! Enjoy the best accuracy.',
    },
    showNotice: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
export default Settings;
