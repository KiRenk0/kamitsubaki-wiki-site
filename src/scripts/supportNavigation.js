import { initializeSupportNavigation } from '../lib/supportNavigation.mjs';

const page = document.querySelector('[data-support-page]');
if (page) initializeSupportNavigation(page);
