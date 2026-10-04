# Patch Notes

## Summary of Changes
- **SQL Operator Precedence (SQL/Oracle/Repository)**: Fixed operator precedence in `TaskRepository`, `search_tasks.sql`, and `task_search_package.sql` by wrapping `(LOWER(title) LIKE :term OR LOWER(description) LIKE :term)` in parentheses. Prevents archived tasks from leaking and ensures status filters apply correctly to both title and description matches.
- **Frontend Race Conditions & Stuck Loading (`useTasks.js`)**: Added cancellation flags to ignore stale/out-of-order async responses, reset errors on new fetches, and ensured `loading` is set to `false` in error handlers.
- **Debounced Search (`useTasks.js`)**: Added a 300ms debounce to search query inputs to stop per-keystroke API spam.
- **Pagination Reset (`App.jsx`)**: Reset page to 1 whenever search query or status filter changes to prevent empty page states.
- **Backend Stability & Sanitization (`TaskController.java`)**: Removed artificial `Thread.sleep` blocking, validated `status` input against `TaskStatus` with 400 Bad Request handling, and clamped pagination inputs (`page >= 1`, `1 <= pageSize <= 100`).

## What I Chose Not to Change
- **Full Database-Level Pagination**: Kept Spring Data repository method signature intact rather than migrating to `Pageable`/Spring Data Page queries to minimize regression risks and maintain zero breaking contract changes within the timebox.
- **UI Redesign**: Preserved the minimal vanilla styling and component structure without introducing extra dependencies.

## Biggest Remaining Risk
The backend currently loads all matching database records into memory before slicing them for pagination (`subList`). Under high data volumes (e.g. 100k+ rows), this will cause significant JVM memory pressure, GC pauses, and latency. Moving to native database-level pagination (SQL `LIMIT`/`OFFSET` or Spring Data `Pageable`) is recommended before production scaling.

## Tools & AI Used
Used Gemini 3.7 Flash to audit the full stack, pinpoint SQL operator precedence edge cases, and refine the debounce/cancellation logic in `useTasks.js`.
