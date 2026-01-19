// Validation Functions

// Validate required field
export function validateRequired(value, fieldName) {
  if (!value || String(value).trim() === '') {
    return `${fieldName} é obrigatório`;
  }
  return null;
}

// Validate email
export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return 'Email inválido';
  }
  return null;
}

// Validate number
export function validateNumber(value, fieldName, min = null, max = null) {
  const num = Number(value);
  
  if (isNaN(num)) {
    return `${fieldName} deve ser um número válido`;
  }
  
  if (min !== null && num < min) {
    return `${fieldName} deve ser maior ou igual a ${min}`;
  }
  
  if (max !== null && num > max) {
    return `${fieldName} deve ser menor ou igual a ${max}`;
  }
  
  return null;
}

// Validate positive number
export function validatePositive(value, fieldName) {
  const num = Number(value);
  
  if (isNaN(num) || num <= 0) {
    return `${fieldName} deve ser um número positivo`;
  }
  
  return null;
}

// Validate integer
export function validateInteger(value, fieldName) {
  const num = Number(value);
  
  if (isNaN(num) || !Number.isInteger(num)) {
    return `${fieldName} deve ser um número inteiro`;
  }
  
  return null;
}

// Validate length
export function validateLength(value, fieldName, min = null, max = null) {
  const length = String(value).length;
  
  if (min !== null && length < min) {
    return `${fieldName} deve ter no mínimo ${min} caracteres`;
  }
  
  if (max !== null && length > max) {
    return `${fieldName} deve ter no máximo ${max} caracteres`;
  }
  
  return null;
}

// Validate unique code
export async function validateUniqueCode(code, existingCodes) {
  if (existingCodes.includes(code)) {
    return 'Este código já existe';
  }
  return null;
}

// Validate stock
export function validateStock(quantity, available) {
  if (quantity > available) {
    return `Stock insuficiente. Disponível: ${available}`;
  }
  return null;
}

// Validate CNPJ
export function validateCNPJ(cnpj) {
  cnpj = cnpj.replace(/[^\d]+/g, '');

  if (cnpj.length !== 14) return false;

  // Eliminate known invalid CNPJs
  if (/^(\d)\1+$/.test(cnpj)) return false;

  // Validate verification digits
  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  const digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += numbers.charAt(length - i) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result != digits.charAt(0)) return false;

  length = length + 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += numbers.charAt(length - i) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result != digits.charAt(1)) return false;

  return true;
}

// Validate form
export function validateForm(formData, rules) {
  const errors = {};
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = formData[field];
    
    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Show field error
export function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  
  // Remove existing error
  const existingError = field.parentElement.querySelector('.field-error');
  if (existingError) {
    existingError.remove();
  }
  
  // Add error class
  field.classList.add('border-red-500');
  
  // Add error message
  if (message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error text-red-500 text-sm mt-1';
    errorDiv.textContent = message;
    field.parentElement.appendChild(errorDiv);
  }
}

// Clear field error
export function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  
  field.classList.remove('border-red-500');
  
  const existingError = field.parentElement.querySelector('.field-error');
  if (existingError) {
    existingError.remove();
  }
}

// Clear all errors
export function clearAllErrors(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  
  const fields = form.querySelectorAll('.border-red-500');
  fields.forEach(field => field.classList.remove('border-red-500'));
  
  const errors = form.querySelectorAll('.field-error');
  errors.forEach(error => error.remove());
}
