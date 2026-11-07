# Test Case: Successful Login

## TC-001: Standard User Login Success
**Priority:** High  
**Component:** Authentication  
**Preconditions:**  
- Application is running at http://localhost:3000  
- User is on the login page  

**Test Steps:**
1. Navigate to /login page
2. Enter valid username: "standard_user"
3. Enter valid password: "secret_sauce"
4. Click login button
5. Verify dashboard page is displayed
6. Verify user menu shows user name
7. Take screenshot for evidence

**Expected Results:**
- Dashboard title displayed: "Products"
- Logout button visible in top-right
- Inventory items list displayed
- No error messages shown

**Postconditions:**
- User is authenticated session established
- Cookies set for session management

**Defect Links:**
- DL-001: Lockout occurred after 3 failed attempts (fixed in v1.2)
- DL-005: "Remember me" checkbox not persisting session

**Test Data:**
| Field | Value |
|-------|-------|
| Username | standard_user |
| Password | secret_sauce |
| Expected Dashboard | Products page |