// Safely parse JSON fields that might be stored as strings
export const parseJsonField = (field: any) => {
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch (e) {
      // If parsing fails, return an empty array or the original string
      // depending on what you expect. An empty array is often safer.
      return [];
    }
  }
  // If it's not a string, return it as is (assuming it's already an array/object)
  return field || [];
};

// Format dates into a more readable format (e.g., "September 28, 2025")
export const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    return dateString; // Return original string if formatting fails
  }
};

// Truncate long text and add an ellipsis
export const truncateText = (text: string, maxLength: number) => {
  if (!text) return '';
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};
