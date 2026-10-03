export const canonicalizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  const trimmed = email.trim().toLowerCase();
  const parts = trimmed.split('@');
  if (parts.length !== 2) return trimmed;

  let [local, domain] = parts;

  // Handle gmail canonicalization (remove dots and strip plus tags)
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    local = local.replace(/\./g, '');
    const plusIndex = local.indexOf('+');
    if (plusIndex !== -1) {
      local = local.substring(0, plusIndex);
    }
  }

  return `${local}@${domain}`;
};
