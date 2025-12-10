const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lostItemSchema = new Schema({
  reportId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  itemName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100,
    trim: true
  },
  description: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000,
    trim: true
  },
  category: {
    type: String,
    enum: ['PHONE', 'WALLET', 'BAG', 'LAPTOP', 'WATCH', 'BOOK', 'KEYS', 'OTHER'],
    required: true,
    index: true
  },
  color: {
    type: String,
    required: false,
    maxlength: 50,
    trim: true,
    default: ''
  },
  features: [{ type: String, maxlength: 100 }],
  dateLost: {
    type: Date,
    required: true,
    index: true
  },
  locationLost: {
    type: String,
    required: false,
    maxlength: 200,
    trim: true,
    default: ''
  },
  campus: {
    type: String,
    enum: ['NVH', 'SHTP'],
    required: true,
    index: true
  },
  images: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.length <= 5;
      },
      message: 'Maximum 5 images allowed'
    }
  },
  phone: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'matched', 'returned'],
    default: 'pending',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  },
  verifiedBy: String,
  verifiedAt: Date,
  rejectionReason: String,
  matchedWithFoundId: String,
  matchedAt: Date,
  returnedAt: Date,
  returnTransactionId: String,
  searchTags: [String],
  isVisible: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 90*24*60*60*1000)
  }
}, { timestamps: true });

// Text index for search
lostItemSchema.index({ itemName: 'text', description: 'text', searchTags: 'text' });

module.exports = mongoose.model('LostItem', lostItemSchema);

