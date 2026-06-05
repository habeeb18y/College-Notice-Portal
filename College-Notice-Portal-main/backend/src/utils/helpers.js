const crypto = require('crypto');

const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

const formatResponse = (data, message = 'Success', status = 200) => {
  return {
    status,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

const paginate = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { limit: parseInt(limit), offset };
};

const formatPaginationResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  };
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

const formatDate = (date = new Date()) => {
  return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
};

const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const extractFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const extension = extractFileExtension(filename).toLowerCase();
  return imageExtensions.includes(extension);
};

const generateUniqueFilename = (originalFilename) => {
  const extension = extractFileExtension(originalFilename);
  const timestamp = Date.now();
  const randomString = generateRandomString(8);
  return `${timestamp}-${randomString}.${extension}`;
};

const maskEmail = (email) => {
  const [username, domain] = email.split('@');
  const maskedUsername = username.slice(0, 2) + '*'.repeat(username.length - 2);
  return `${maskedUsername}@${domain}`;
};

const maskPhone = (phone) => {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strength = {
    minLength: password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar
  };
  
  const score = Object.values(strength).filter(Boolean).length;
  
  return {
    ...strength,
    score,
    isStrong: score >= 4
  };
};

module.exports = {
  generateRandomString,
  formatResponse,
  paginate,
  formatPaginationResponse,
  sanitizeInput,
  isValidDate,
  formatDate,
  calculateAge,
  slugify,
  extractFileExtension,
  isImageFile,
  generateUniqueFilename,
  maskEmail,
  maskPhone,
  escapeHtml,
  validatePasswordStrength
};
