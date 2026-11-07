# Login-Related Defects

## DL-001: Premature Account Lockout
**Severity:** High  
**Module:** Authentication  
**Status:** Fixed v1.2  
**Description:** Account locked out after 3 failed attempts instead of the specified 5 attempts.  
**Root Cause:** Incorrect counter reset logic in authentication service.  
**Fix Applied:** Reset counter after successful login; corrected lockout threshold to 5 attempts.  
**Test Coverage:** TC-002 now verifies lockout at attempt 5.  
**Related Requirements:** LOGIN-REQ-003  

## DL-005: Remember Me Not Persisting
**Severity:** Medium  
**Module:** Authentication  
**Status:** Investigating  
**Description:** When "Remember me" is selected, session does not persist across browser restarts.  
**Root Cause:** Token not being stored in persistent storage; only stored in memory.  
**Fix Applied:** TBD - requires backend changes to token persistence.  
**Workaround:** User must re-login each session.  
**Related Requirements:** LOGIN-REQ-004  

## DL-007: Error Message Localization
**Severity:** Low  
**Module:** Authentication  
**Status:** Fixed  
**Description:** Error messages not following application's i18n patterns; hardcoded English text.  
**Root Cause:** Error messages hardcoded instead of i18n keys.  
**Fix Applied:** Changed to use i18n key "login.error.generic"; added translations.  
**Test Coverage:** All language locales now display correct messages.  
**Related Requirements:** LOGIN-REQ-006  

## DL-010: Password Visibility Toggle Accessibility
**Severity:** Low  
**Module:** Authentication  
**Status:** Fixed  
**Description:** Password visibility toggle not keyboard accessible; aria-expanded not updated.  
**Root Cause:** Missing aria-expanded attribute updates on toggle.  
**Fix Applied:** Added proper aria-expanded state management.  
**Test Coverage:** Keyboard users can now toggle visibility.  
**Related Requirements:** LOGIN-REQ-007