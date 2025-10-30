import { DateTime } from 'luxon';

import { initTabMenuScrolling } from './session-tabs';
import {
  debug,
  formatTime,
  getNextOccurrences,
  parseBlackoutDates,
  parseDate,
  type RecurrencePattern,
} from './utils';

interface SessionData {
  recurrences: RecurrencePattern[];
  blackoutDates: DateTime[];
  registrationLinks: string[];
  timezone: string;
}

const NUM_OCCURRENCES_TO_SHOW = 3;

/**
 * Parse session data from the #data-saver element
 */
function parseSessionData(element: HTMLElement): SessionData | null {
  const timezone = 'America/New_York'; // Default to ET

  // Parse recurrence patterns (up to 2)
  const recurrences: RecurrencePattern[] = [];
  const registrationLinks: string[] = [];

  for (let i = 1; i <= 2; i++) {
    const startDateStr = element.getAttribute(`data-start-${i}`);
    const frequency = element.getAttribute(`data-frequency-${i}`);
    const durationStr = element.getAttribute(`data-duration-${i}`);
    const endDateStr = element.getAttribute(`data-end-${i}`);
    const link = element.getAttribute(`data-link-${i}`);

    // Skip if no start date for this recurrence
    if (!startDateStr || !startDateStr.trim()) {
      continue;
    }

    if (!frequency || !durationStr) {
      console.error(`[Recurrence ${i}] Missing frequency or duration`);
      continue;
    }

    const startDate = parseDate(startDateStr, timezone);
    if (!startDate) {
      console.error(`[Recurrence ${i}] Invalid start date:`, startDateStr);
      continue;
    }

    const duration = parseInt(durationStr, 10);
    let until: DateTime | undefined;

    if (endDateStr && endDateStr.trim()) {
      until = parseDate(endDateStr, timezone) || undefined;
    }

    recurrences.push({
      startDate,
      frequency,
      duration,
      until,
    });

    registrationLinks.push(link || '');
  }

  if (recurrences.length === 0) {
    console.error('[parseSessionData] No valid recurrence patterns found');
    return null;
  }

  // Parse blackout dates
  const blackoutDateString = element.getAttribute('data-blackout-date-string') || '';
  const blackoutDates = parseBlackoutDates(blackoutDateString, timezone);

  return {
    recurrences,
    blackoutDates,
    registrationLinks,
    timezone,
  };
}

/**
 * Update the UI for a recurrence pattern
 */
function updateRecurrenceUI(
  index: number,
  recurrence: RecurrencePattern,
  blackoutDates: DateTime[],
  registrationLink: string,
  showInUserTimezone: boolean
): void {
  const container = document.querySelector(`#datetimes-${index}`);
  if (!container) {
    debug(`[updateRecurrenceUI] Container #datetimes-${index} not found`);
    return;
  }

  debug(`\n[updateRecurrenceUI] Processing recurrence ${index}`);
  debug(`  - Start date: ${recurrence.startDate.toISO()}`);
  debug(`  - Frequency: ${recurrence.frequency}`);
  debug(`  - Until: ${recurrence.until?.toISO() || 'none'}`);
  debug(`  - Current time: ${DateTime.now().toISO()}`);

  // Get next NUM_OCCURRENCES_TO_SHOW occurrences
  const occurrences = getNextOccurrences(
    recurrence.startDate,
    recurrence.frequency,
    blackoutDates,
    NUM_OCCURRENCES_TO_SHOW,
    recurrence.until
  );

  debug(`  - Found ${occurrences.length} occurrences`);
  if (occurrences.length > 0) {
    debug(`  - First occurrence: ${occurrences[0].toISO()}`);
    debug(`  - Last occurrence: ${occurrences[occurrences.length - 1].toISO()}`);
  }

  if (occurrences.length === 0) {
    debug(`[updateRecurrenceUI] No future occurrences for recurrence ${index}`);
    // Hide the container if no occurrences
    (container as HTMLElement).style.display = 'none';
    return;
  }

  // Show the container
  (container as HTMLElement).style.display = '';

  // Convert to user's timezone if checkbox is checked
  const displayOccurrences = showInUserTimezone
    ? occurrences.map((date) => date.setZone('local'))
    : occurrences;

  // Update list items
  const listElement = container.querySelector('ul.cc_pro-session_tab-list');
  if (listElement) {
    // Clear existing items
    listElement.innerHTML = '';

    // Add new items with the new structure
    displayOccurrences.forEach((date) => {
      const li = document.createElement('li');
      li.className = 'pro-session_list-item';

      // Date div (e.g., "Jan 13")
      const dateDiv = document.createElement('div');
      dateDiv.textContent = date.toFormat('MMM d');

      // Dotted line separator
      const separatorDiv = document.createElement('div');
      separatorDiv.className = 'dotted-line';

      // Time div (e.g., "11AM - 12PM ET")
      const endDate = date.plus({ minutes: recurrence.duration });
      const startTime = formatTime(date.hour, date.minute);
      const endTime = formatTime(endDate.hour, endDate.minute);
      const timezoneAbbr = date.toFormat('ZZZZ');
      const timeText = `${startTime} - ${endTime} ${timezoneAbbr}`;

      const timeDiv = document.createElement('div');
      timeDiv.innerHTML = timeText;

      li.appendChild(dateDiv);
      li.appendChild(separatorDiv);
      li.appendChild(timeDiv);
      listElement.appendChild(li);
    });
  }

  // Update registration link
  const linkElement = container.querySelector('a.button');
  if (linkElement && registrationLink) {
    linkElement.setAttribute('href', registrationLink);
    (linkElement as HTMLElement).style.display = 'inline-block';
  } else if (linkElement) {
    (linkElement as HTMLElement).style.display = 'none';
  }

  debug(`[updateRecurrenceUI] Updated recurrence ${index} with ${occurrences.length} dates`);
}

/**
 * Initialize the template page
 */
function initTemplatePage(): void {
  const dataSaver = document.querySelector('#data-saver') as HTMLElement;
  if (!dataSaver) {
    debug('[initTemplatePage] #data-saver element not found');
    return;
  }

  const sessionData = parseSessionData(dataSaver);
  if (!sessionData) {
    return;
  }

  // Query the timezone toggle checkbox
  const tzCheckbox = document.querySelector('#pro-show-in-my-tz') as HTMLInputElement;

  // Function to update all recurrences
  const updateAllRecurrences = () => {
    const showInUserTimezone = tzCheckbox?.checked ?? true; // Default to checked

    sessionData.recurrences.forEach((recurrence, index) => {
      updateRecurrenceUI(
        index + 1,
        recurrence,
        sessionData.blackoutDates,
        sessionData.registrationLinks[index],
        showInUserTimezone
      );
    });
  };

  // Initial update
  updateAllRecurrences();

  // Listen for checkbox changes
  if (tzCheckbox) {
    tzCheckbox.addEventListener('change', updateAllRecurrences);
  }

  debug('[initTemplatePage] Template page initialized');
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initTemplatePage();
    initTabMenuScrolling();
  });
} else {
  initTemplatePage();
  initTabMenuScrolling();
}
