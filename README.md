# The Canvas Grades Exporter

A Chrome extension that adds an **“Extract Grades”** button to your Canvas dashboard.  
With one click, it downloads a CSV of your current courses and grades.

This uses Canvas API to pull info on the signed in students enrollments & course data. Then Uses those rows to populate a CSV and Triggers the CSV's download. This is all done after the Export Button in the bottom right hand side of screen is activated.

---

## How to Install and Operate

### 1. Download the extension
- Download the Canvas Grade Checker file and save it to your computer somewhere you can find it (e.g., Desktop or Documents).

Your folder should look like this:
canvas-grades-export/
    manifest.json
    content.js
    Canvas-Grade-Exporter-Logo-V1.png
---

### 2. Open Chrome Extensions page
1. Open Chrome and go to: [`chrome://extensions`](chrome://extensions)  
2. In the top-right corner, toggle **Developer mode** on.  

---

### 3. Load the extension
1. Click **Load unpacked**.  
2. Select the extracted `canvas-grades-export/` folder.  
3. You should now see **Canvas Grades Exporter** in your extensions list (Named `Canvas Grades Exporter`).

---

## Usage

1. Log into your school’s **Canvas** site.  
2. Open your **Dashboard**.  
3. Look in the bottom-right corner — you’ll see a red button labeled **Extract Grades**.  
4. Click it!  
   - A CSV file will download automatically, named something like:  
     ```
     canvas_grades.csv
     ```
   - Open it in Excel, Google Sheets, or any spreadsheet program.

---

## The CSV Output

The exported file contains the following columns:

- **Course ID**  
- **Course Name**  
- **Current Grade**
- **Current Letter Grade**  
- **Date**

---

## Troubleshooting

- **Button not visible?** Refresh the Canvas Dashboard page.  
- **No CSV downloaded?** Make sure you’re logged into Canvas in that tab.  
- **Error messages?** Press `F12` → check the **Console** tab in Chrome DevTools.  
- **Still Stuggling** Message `joeyhugg@colostate.edu` about your issue.

---