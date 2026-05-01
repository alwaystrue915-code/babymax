import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema(
  {
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
      default: 'Sailent Predictor',
    },
    appDownloadLink: {
      type: String,
      default: '#',
    },
    appLogoUrl: {
      type: String,
      default: 'https://cdn.nexapk.in/image17.webp',
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
      default: 'Sailent Predictor',
    },
    upiAmount: {
      type: Number,
      default: 499,
    },
    noticeText: {
      type: String,
      default: 'Welcome to Sailent Predictor Pro! Enjoy the best accuracy.',
    },
    showNotice: {
      type: Boolean,
      default: true,
    },
    apiSecretKey: {
      type: String,
      default: 'sailent_secure_v1_key',
    },
  },
  {
    timestamps: true,
  }
);

// Force clear model from cache in development to ensure schema updates are applied
if (mongoose.models.Settings) {
  delete mongoose.models.Settings;
}

const Settings = mongoose.model('Settings', SettingsSchema);

export default Settings;
