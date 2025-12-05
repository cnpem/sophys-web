---
"@sophys-web/widgets": patch
---

Improve pause icons by using a pair of icons in each button (pause + clock with exclamation mark for "pause now" and pause + milestone for "pause in the next checkpoint").
Change pause pending state to never block the "pause now" button, allowing users to pause immediately even if a pause is already scheduled. Also add a pulsating animation to the buttons and tooltip message to indicate that a pause is already scheduled.
