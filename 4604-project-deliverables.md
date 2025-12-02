**Cache Me If You Can project requirements + workflow**

**What the App Should Do:**

- Users can **sign up**, **log in**, **log out**, and **change passwords**
- Each user has:
  - Username
  - Password
  - Role: Runner or Leader

**Roles and Permissions**

| **Role** | **Can Do** |
| --- | --- |
| Runner | Sign up, join runs, leave runs, view status of joined or completed runs |
| Leader | All capabilities of normal runner, create new runs, change their status, view runners in their runs |

**Core Functionality**

| **Feature** | **Description** | **Tables affected** |
| --- | --- | --- |
| Signup/login | Create or authenticate users. Redirect based on role | Runner |
| Create run(Leader) | Add a new run with all necessary information(route info, description, etc) | Run, Route, Location |
| Join run(Runner) | Runner joins an existing run | Run_participation |
| Leave run | Runner leaves a run they have joined | Run_participation |
| Delete run/user | Removes a user or a run from the database | Run, Runner |

**Application Flow**

**Login/Signup**

- User visits login page.
- If new -> goes to signup -> enters username, password, role
- If returning -> logs in -> backend verifies credentials
- If successful:
  - Runner -> Runner Dashboard
  - Leader -> Leader Dashboard

**Runner Dashboard**

- See list of upcoming runs.
- Join or leave runs.
- View all runs joined or completed.

**Leader Dashboard**

- Create new runs (route, location, start/end, status).
- See runs they created.
- Change status or delete a run.

**Milestone 3 deliverables:**

Screenshots of the current functionality **working from the GUI interface (Whether it is web-based or an app that you built)** and reflected on the data in the database.

A paragraph on the current progress and **who is doing what.**

**Bonus Points:**

You will get 5 bonus points if you have a real customer for your project.  
Projects with globalized datasets for heritage perseverance will also be  
awarded the 5 points.