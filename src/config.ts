// Central configuration. The app reads its question papers as static JSON
// served from the GitHub repository via the raw CDN. No backend server.

// GitHub account + repo that host the generated content.
export const GITHUB_OWNER = 'adityajain3182';
export const GITHUB_REPO = 'current-affairs-app';
export const GITHUB_BRANCH = 'main';

// jsDelivr serves the same repo files with proper CDN caching and CORS, and is
// faster/more reliable than raw.githubusercontent.com. Falls back to raw.
export const CONTENT_CDN_BASE = `https://cdn.jsdelivr.net/gh/${GITHUB_OWNER}/${GITHUB_REPO}@${GITHUB_BRANCH}`;
export const CONTENT_RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}`;

export const INDEX_PATH = 'content/index.json';

export const APP_NAME = 'Current Affairs Daily';
