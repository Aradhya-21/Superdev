# Handwritten Explanations Guide

Place photos/scans of your handwritten notes in this folder as required by `README.md`.

### Quick Reference for Your Handwritten Notes:

#### 1. SQL Operator Precedence Bug
- **Location**: [TaskRepository.java](file:///d:/Superdev/backend/src/main/java/com/internal/tasktracker/TaskRepository.java#L14-L17), [search_tasks.sql](file:///d:/Superdev/db/queries/search_tasks.sql#L10-L13), [task_search_package.sql](file:///d:/Superdev/db/oracle/task_search_package.sql#L52-L55)
- **Discovery**: Querying for `status=OPEN` and term `api` returned `IN_PROGRESS` tasks; archived tasks were leaking when description matched.
- **Root Cause**: In SQL, `AND` takes precedence over `OR`. Without parentheses around `(LOWER(title) LIKE :term OR LOWER(description) LIKE :term)`, the `archived` condition only attached to title, and the `status` condition only attached to description.
- **Fix**: Wrapped the title and description OR conditions in parentheses `(LOWER(...) OR LOWER(...))` across all SQL/repository files.

#### 2. Frontend Race Conditions & Broken Error State
- **Location**: [useTasks.js](file:///d:/Superdev/frontend/src/hooks/useTasks.js#L20-L46)
- **Discovery**: Fast typing caused older responses to arrive after newer ones, overwriting results with stale data; failed fetches left loading permanently true.
- **Root Cause**: `useEffect` lacked cancellation/active flag handling, and `catch` block did not set `loading` to false or clear error on subsequent requests.
- **Fix**: Added active cancellation flag `isCurrent`, 300ms debounce on search term, reset errors on fetch start, and guaranteed `loading: false` in catch block.

#### 3. Pagination Reset on Search/Filter
- **Location**: [App.jsx](file:///d:/Superdev/frontend/src/App.jsx#L16-L23)
- **Discovery**: When on page 3, typing a search term with only 1 page of results displayed an empty list.
- **Root Cause**: `page` remained at previous value instead of resetting to 1 when search or status filters changed.
- **Fix**: Implemented `handleQueryChange` and `handleStatusChange` handlers that reset `page` to 1.

#### 4. Backend Stability & Artificial Blocking
- **Location**: [TaskController.java](file:///d:/Superdev/backend/src/main/java/com/internal/tasktracker/TaskController.java#L30-L50)
- **Discovery**: Reviewing controller code revealed artificial `Thread.sleep` blocking Tomcat threads, unhandled `IllegalArgumentException` on invalid status query params (causing 500 errors), and unsanitized page inputs.
- **Root Cause**: `TaskStatus.valueOf(...)` directly threw unchecked exceptions on invalid input; sleep blocked request threads.
- **Fix**: Removed `Thread.sleep`, safely caught/validated status enum with 400 Bad Request response, and clamped `page >= 1` and `1 <= pageSize <= 100`.
