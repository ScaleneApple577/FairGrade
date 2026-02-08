// File utility functions for handling Google Drive files

/**
 * Extract the Google Drive file ID from various Google document URLs
 * Supports: Google Docs, Sheets, Slides, and Drive file links
 */
export function extractDriveFileId(url: string): string | null {
  const patterns = [
    /\/document\/d\/([a-zA-Z0-9_-]+)/,      // Google Docs
    /\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/,  // Google Sheets
    /\/presentation\/d\/([a-zA-Z0-9_-]+)/,  // Google Slides
    /\/file\/d\/([a-zA-Z0-9_-]+)/,          // Google Drive files
    /id=([a-zA-Z0-9_-]+)/,                   // Drive share links with id param
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Determine the MIME type from a Google URL
 */
export function getMimeTypeFromUrl(url: string): string {
  if (url.includes('/document/')) return 'application/vnd.google-apps.document';
  if (url.includes('/spreadsheets/')) return 'application/vnd.google-apps.spreadsheet';
  if (url.includes('/presentation/')) return 'application/vnd.google-apps.presentation';
  return 'application/octet-stream';
}

/**
 * Construct a Google file URL from the drive_file_id and mime_type
 */
export function getGoogleFileUrl(driveFileId: string, mimeType: string): string {
  if (mimeType.includes('document')) {
    return `https://docs.google.com/document/d/${driveFileId}/edit`;
  }
  if (mimeType.includes('spreadsheet')) {
    return `https://docs.google.com/spreadsheets/d/${driveFileId}/edit`;
  }
  if (mimeType.includes('presentation')) {
    return `https://docs.google.com/presentation/d/${driveFileId}/edit`;
  }
  return `https://drive.google.com/file/d/${driveFileId}/view`;
}

/**
 * Get a human-readable label for a file type based on MIME type
 */
export function getFileTypeLabel(mimeType: string): string {
  if (mimeType.includes('document')) return 'Google Doc';
  if (mimeType.includes('spreadsheet')) return 'Google Sheet';
  if (mimeType.includes('presentation')) return 'Google Slides';
  return 'File';
}

/**
 * Get an emoji icon for a file type based on MIME type
 */
export function getFileIcon(mimeType: string): string {
  if (mimeType.includes('document')) return '📄';
  if (mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('presentation')) return '📽';
  return '📁';
}

/**
 * Validate that a URL is a valid Google Docs/Sheets/Slides URL
 */
export function isValidGoogleUrl(url: string): boolean {
  const patterns = [
    /docs\.google\.com\/document/,
    /docs\.google\.com\/spreadsheets/,
    /docs\.google\.com\/presentation/,
    /drive\.google\.com\/file/,
  ];
  return patterns.some(pattern => pattern.test(url));
}
