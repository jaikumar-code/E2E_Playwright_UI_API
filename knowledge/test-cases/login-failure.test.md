# Test Case: Failed Login

## TC-002: Locked Out User Login Failure
**Priority:** High  
**Component:** Authentication  
**Preconditions:**  
- Application is running at http://localhost:3000  
- User is on the login page  

**Test Steps:**
1. Navigate to /login page
2. Enter locked-out username: "locked_out_user"
3. Enter password: "secret_sauce"
4. Click login button
5. Verify error message is displayed
6. Verify login fails

**Expected Results:**
- Error message: "Epic sadface: Sorry, this user has been locked out."
- Login page remains displayed
- Login button remains enabled

**Postconditions:**
- User is still on login page
- Account lockout state preserved

**Defect Links:**
- None

**Test Data:**
| Field | Value |
|-------|-------|
| Username | locked_out_user |
| Password | secret_sauce |
| Expected Outcome | Error message displayed |

## TC-003: Problem User Login
**Priority:** Medium  
**Component:** Authentication  

**Test Steps:**
1. Navigate to /login page
2. Enter username: "problem_user"
3. Enter password: "secret_sauce"
4. Click login button
5. Verify login succeeds (problem user has standard access)

**Expected Results:**
- Login succeeds
- User redirected to inventory page