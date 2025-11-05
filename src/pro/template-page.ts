import { DateTime } from 'luxon';

import { initTabMenuScrolling } from './session-tabs';
import {
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
console.log('NUM_OCCURRENCES_TO_SHOW', NUM_OCCURRENCES_TO_SHOW);

/**
 * Parse session data from the #data-saver element
 *
 * Expected data attributes:
 * - data-start-1, data-start-2: Date strings in format "YYYY-MM-DD H:mm" (Eastern Time, 24-hour format)
 * - data-frequency-1, data-frequency-2: "weekly", "daily", "biweekly", "monthly"
 * - data-duration-1, data-duration-2: Duration in minutes
 * - data-end-1, data-end-2: Optional end date in format "YYYY-MM-DD"
 * - data-link-1, data-link-2: Registration links
 * - data-blackout-date-string: Comma-separated dates in MM/DD/YYYY format
 */
function parseSessionData(element: HTMLElement): SessionData | null {
  console.log('[parseSessionData] Starting to parse session data');
  const timezone = 'America/New_York'; // Default to ET

  // Parse recurrence patterns (up to 2)
  const recurrences: RecurrencePattern[] = [];
  const registrationLinks: string[] = [];

  for (let i = 1; i <= 2; i++) {
    console.log(`[parseSessionData] Processing recurrence ${i}`);
    // Access data attributes with hyphens using bracket notation (same as index.ts)
    const startDateStr = element.getAttribute(`data-start-${i}`);
    const frequency = element.getAttribute(`data-frequency-${i}`);
    const durationStr = element.getAttribute(`data-duration-${i}`);
    const endDateStr = element.getAttribute(`data-end-${i}`);
    const link = element.getAttribute(`data-link-${i}`);

    console.log(`[parseSessionData] Recurrence ${i} attributes:`, {
      startDateStr,
      frequency,
      durationStr,
      endDateStr,
      link,
    });

    // Skip if no start date for this recurrence
    if (!startDateStr || !startDateStr.trim()) {
      console.log(`[parseSessionData] Skipping recurrence ${i} - no start date`);
      continue;
    }

    if (!frequency || !durationStr) {
      console.error(`Missing frequency or duration for recurrence ${i}`, element);
      continue;
    }

    let startDate = parseDate(startDateStr, timezone);
    if (!startDate) {
      console.error(`Invalid start date for recurrence ${i}:`, startDateStr);
      continue;
    }

    // Check if date was parsed as midnight (no time provided)
    // If so, check for a separate time attribute or apply default time
    if (startDate.hour === 0 && startDate.minute === 0) {
      console.log(
        `[parseSessionData] Recurrence ${i} parsed as midnight, checking for time attribute`
      );

      // Try to get time from a separate attribute (e.g., data-time-1)
      const timeStr = element.getAttribute(`data-time-${i}`);
      if (timeStr && timeStr.trim()) {
        console.log(`[parseSessionData] Found time attribute for recurrence ${i}:`, timeStr);
        // Try to parse the time and combine with the date
        const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (timeMatch) {
          let hour = parseInt(timeMatch[1], 10);
          const minute = parseInt(timeMatch[2], 10);
          const period = timeMatch[3]?.toUpperCase();

          if (period === 'PM' && hour !== 12) {
            hour += 12;
          } else if (period === 'AM' && hour === 12) {
            hour = 0;
          }

          startDate = startDate.set({ hour, minute });
          console.log(
            `[parseSessionData] Applied time from attribute: ${hour}:${minute.toString().padStart(2, '0')}`
          );
        }
      } else {
        // Apply default times based on recurrence pattern
        // Recurrence 1 (typically Thursday): 11:00 AM ET
        // Recurrence 2 (typically Tuesday): 3:00 PM ET (15:00)
        const defaultHour = i === 1 ? 11 : 15; // 11 AM for first, 3 PM for second
        const defaultMinute = 0;
        startDate = startDate.set({ hour: defaultHour, minute: defaultMinute });
        console.log(
          `[parseSessionData] Applied default time for recurrence ${i}: ${defaultHour}:${defaultMinute.toString().padStart(2, '0')}`
        );
      }
    }

    console.log(`[parseSessionData] Recurrence ${i} parsed start date:`, {
      input: startDateStr,
      parsedISO: startDate.toISO(),
      parsedET: startDate.toFormat('yyyy-MM-dd HH:mm ZZZZ'),
      parsedLocal: startDate.setZone('local').toFormat('yyyy-MM-dd HH:mm ZZZZ'),
    });

    const duration = parseInt(durationStr, 10);
    let until: DateTime | undefined;

    if (endDateStr && endDateStr.trim()) {
      until = parseDate(endDateStr, timezone) || undefined;
      if (until) {
        console.log(
          `[parseSessionData] Recurrence ${i} until date:`,
          until.toFormat('yyyy-MM-dd ZZZZ')
        );
      }
    }

    recurrences.push({
      startDate,
      frequency,
      duration,
      until,
    });

    registrationLinks.push(link || '');
    console.log(`[parseSessionData] Recurrence ${i} added successfully`);
  }

  if (recurrences.length === 0) {
    console.error('No valid recurrence patterns found', element);
    return null;
  }

  // Parse blackout dates (same as index.ts)
  const blackoutDateString = element.getAttribute('data-blackout-date-string') || '';
  const blackoutDates = parseBlackoutDates(blackoutDateString, timezone);

  console.log('[parseSessionData] Final parsed data:', {
    recurrencesCount: recurrences.length,
    blackoutDatesCount: blackoutDates.length,
    blackoutDates: blackoutDates.map((d) => d.toFormat('yyyy-MM-dd')),
    registrationLinks,
  });

  return {
    recurrences,
    blackoutDates,
    registrationLinks,
    timezone,
  };
}

/**
 * Update the UI for a recurrence pattern
 * Times are always displayed in the user's local timezone
 */
function updateRecurrenceUI(
  index: number,
  recurrence: RecurrencePattern,
  blackoutDates: DateTime[],
  registrationLink: string
): void {
  console.log(`[updateRecurrenceUI] Starting update for recurrence ${index}`);
  const container = document.querySelector(`#datetimes-${index}`);
  if (!container) {
    console.error(`[updateRecurrenceUI] Container #datetimes-${index} not found`);
    return;
  }
  console.log(`[updateRecurrenceUI] Found container #datetimes-${index}`);

  console.log(`[updateRecurrenceUI] Recurrence ${index} data:`, {
    startDateET: recurrence.startDate.toFormat('yyyy-MM-dd HH:mm ZZZZ'),
    startDateISO: recurrence.startDate.toISO(),
    frequency: recurrence.frequency,
    duration: recurrence.duration,
    until: recurrence.until?.toFormat('yyyy-MM-dd ZZZZ') || 'none',
    currentTime: DateTime.now().toFormat('yyyy-MM-dd HH:mm ZZZZ'),
    blackoutDatesCount: blackoutDates.length,
  });

  // Get next NUM_OCCURRENCES_TO_SHOW occurrences
  const occurrences = getNextOccurrences(
    recurrence.startDate,
    recurrence.frequency,
    blackoutDates,
    NUM_OCCURRENCES_TO_SHOW,
    recurrence.until
  );

  console.log(
    `[updateRecurrenceUI] Found ${occurrences.length} occurrences:`,
    occurrences.map((occ) => ({
      iso: occ.toISO(),
      et: occ.toFormat('yyyy-MM-dd HH:mm ZZZZ'),
      local: occ.setZone('local').toFormat('yyyy-MM-dd HH:mm ZZZZ'),
    }))
  );

  if (occurrences.length === 0) {
    console.warn(`[updateRecurrenceUI] No future occurrences for recurrence ${index}`);
    // Hide the container if no occurrences
    (container as HTMLElement).style.display = 'none';
    return;
  }

  // Show the container
  (container as HTMLElement).style.display = '';

  // Update list items
  const listElement = container.querySelector('ul.cc_pro-session_tab-list');
  if (!listElement) {
    console.error(`[updateRecurrenceUI] List element not found in container ${index}`);
    return;
  }
  console.log(
    `[updateRecurrenceUI] Found list element, clearing and adding ${occurrences.length} items`
  );

  // Clear existing items
  listElement.innerHTML = '';

  // Add new items with the new structure
  occurrences.forEach((occurrence, occIndex) => {
    // Always convert to user's local timezone (dates are input in America/New_York)
    const displayDate = occurrence.setZone('local');

    // Calculate end time based on duration
    const endDate = displayDate.plus({ minutes: recurrence.duration });

    const dateText = displayDate.toFormat('MMM d');
    const startTime = formatTime(displayDate.hour, displayDate.minute);
    const endTime = formatTime(endDate.hour, endDate.minute);
    const timezoneAbbr = displayDate.toFormat('ZZZZ'); // "PT", "ET", etc.
    const timeText = `${startTime} - ${endTime} ${timezoneAbbr}`;

    console.log(`[updateRecurrenceUI] Occurrence ${occIndex + 1}:`, {
      dateText,
      timeText,
      displayDateET: occurrence.toFormat('yyyy-MM-dd HH:mm ZZZZ'),
      displayDateLocal: displayDate.toFormat('yyyy-MM-dd HH:mm ZZZZ'),
      hour: displayDate.hour,
      minute: displayDate.minute,
    });

    const li = document.createElement('li');
    li.className = 'pro-session_list-item';

    // Date div (e.g., "Jan 13")
    const dateDiv = document.createElement('div');
    dateDiv.textContent = dateText;

    // Dotted line separator
    const separatorDiv = document.createElement('div');
    separatorDiv.className = 'dotted-line';

    // Time div (e.g., "11AM - 12PM PT") - shows user's local timezone
    const timeDiv = document.createElement('div');
    timeDiv.innerHTML = timeText;

    li.appendChild(dateDiv);
    li.appendChild(separatorDiv);
    li.appendChild(timeDiv);
    listElement.appendChild(li);
  });

  console.log(`[updateRecurrenceUI] Added ${occurrences.length} items to list`);

  // Update registration link
  const linkElement = container.querySelector('a.button');
  if (linkElement && registrationLink) {
    linkElement.setAttribute('href', registrationLink);
    (linkElement as HTMLElement).style.display = 'inline-block';
    console.log(`[updateRecurrenceUI] Set registration link: ${registrationLink}`);
  } else if (linkElement) {
    (linkElement as HTMLElement).style.display = 'none';
    console.log(`[updateRecurrenceUI] No registration link, hiding button`);
  } else {
    console.log(`[updateRecurrenceUI] No link element found`);
  }

  console.log(`[updateRecurrenceUI] Completed update for recurrence ${index}`);
}

/**
 * Initialize the template page
 * Times are always displayed in the user's local timezone
 */
function initTemplatePage(): void {
  console.log('[initTemplatePage] Starting template page initialization');
  const dataSaver = document.querySelector('#data-saver') as HTMLElement;
  if (!dataSaver) {
    console.error('[initTemplatePage] #data-saver element not found');
    return;
  }
  console.log('[initTemplatePage] Found #data-saver element:', dataSaver);

  const sessionData = parseSessionData(dataSaver);
  if (!sessionData) {
    console.error('[initTemplatePage] Failed to parse session data');
    return;
  }

  console.log(
    '[initTemplatePage] Parsed session data successfully, updating UI for',
    sessionData.recurrences.length,
    'recurrences'
  );

  // Update all recurrences (always show in user's local timezone)
  sessionData.recurrences.forEach((recurrence, index) => {
    console.log(`[initTemplatePage] Updating UI for recurrence ${index + 1}`);
    updateRecurrenceUI(
      index + 1,
      recurrence,
      sessionData.blackoutDates,
      sessionData.registrationLinks[index]
    );
  });

  console.log('[initTemplatePage] Template page initialization complete');
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
