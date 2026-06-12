export function validateTitle(v) {
  if (!v?.trim()) return "Issue title is required.";
  if (v.trim().length < 5) return "Title must be at least 5 characters.";
  return null;
}

export function validateDescription(v) {
  if (!v?.trim()) return "Please describe the issue.";
  if (v.trim().length < 10) return "Description must be at least 10 characters.";
  return null;
}

export function validateLocation(v) {
  if (!v?.trim()) return "Location is required.";
  return null;
}

export function validateCategory(v) {
  if (!v?.trim()) return "Please select a category.";
  return null;
}

export function validatePhotos(files) {
  if (!files || files.length === 0) return "Please upload at least one photo.";
  return null;
}

export function validateSeverity(v) {
  if (!v?.trim()) return "Please select a severity level.";
  return null;
}

export function validateFullName(v) {
  if (!v?.trim()) return "Full name is required.";
  return null;
}

export function validateEmail(v) {
  if (!v?.trim()) return "Email address is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Please enter a valid email address.";
  return null;
}

export function validatePhone(v) {
  if (!v?.trim()) return "Phone number is required.";
  if (!/^\+?[\d\s\-()]{7,15}$/.test(v)) return "Please enter a valid phone number.";
  return null;
}

export function validateStep(step, formData) {
  const errs = {};
  if (step === 1) {
    const t = validateTitle(formData.title);
    const d = validateDescription(formData.description);
    if (t) errs.title = t;
    if (d) errs.description = d;
  } else if (step === 2) {
    const l = validateLocation(formData.location);
    if (l) errs.location = l;
  } else if (step === 3) {
    const c = validateCategory(formData.category);
    if (c) errs.category = c;
  } else if (step === 4) {
    const p = validatePhotos(formData.photos);
    if (p) errs.photos = p;
  } else if (step === 5) {
    const s = validateSeverity(formData.severity);
    if (s) errs.severity = s;
  } else if (step === 6) {
    const fn = validateFullName(formData.fullName);
    const em = validateEmail(formData.email);
    const ph = validatePhone(formData.phone);
    if (fn) errs.fullName = fn;
    if (em) errs.email = em;
    if (ph) errs.phone = ph;
  }
  return errs;
}
