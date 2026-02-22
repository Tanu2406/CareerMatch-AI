import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  resumeText: {
    type: String,
    required: true
  },
  resumeFileName: {
    type: String,
    required: true
  },
  jobDescription: {
    type: String,
    required: true
  },
  matchScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  overallScore: {
    type: Number,
    required: false,
    min: 0,
    max: 100
  },
  matchedSkills: [{
    type: String
  }],
  resumeSkills: [{
    type: String
  }],
  missingSkills: [{
    type: String
  }],
  cleanSkills: {
    skills: [{ type: String }],
    jobTitles: [{ type: String }],
    keywords: [{ type: String }]
  },
  breakdown: {
    technical: { type: Number },
    soft: { type: Number },
    experience: { type: Number },
    bonus: { type: Number }
  },
  keywordSuggestions: [{
    type: String
  }],
  improvementTips: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
analysisSchema.index({ userId: 1, createdAt: -1 });

const Analysis = mongoose.model('Analysis', analysisSchema);

export default Analysis;
