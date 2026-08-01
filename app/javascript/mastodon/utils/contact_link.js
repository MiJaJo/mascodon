const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const schemePattern = /^[a-z][a-z\d+.-]*:/i;
const domainPattern = /^(?:[a-z\d-]+\.)+[a-z]{2,}(?:\/.*)?$/i;

function getContactHref(value) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return undefined;
  }

  if (schemePattern.test(trimmedValue)) {
    return trimmedValue;
  }

  if (emailPattern.test(trimmedValue)) {
    return `mailto:${trimmedValue}`;
  }

  if (domainPattern.test(trimmedValue)) {
    return `https://${trimmedValue}`;
  }

  return trimmedValue;
}

module.exports = {
  getContactHref,
};
