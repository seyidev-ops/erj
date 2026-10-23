Drop job sheets (.xlsx or .csv) here (GitHub: Add file > Upload files, into jobs/inbox/).
The Job board workflow runs twice a day (about 5:45am and 7:45pm WAT), imports every eligible row,
then moves the file to done/. Expired, closed and not-Nigeria/Africa roles are left out automatically.
Blank template: ../ERJ_Job_Board_Upload_Template.xlsx
To hold a sheet for a later run, start its name with after-YYYY-MM-DDTHH_ (WAT hour), e.g.
after-2026-10-23T18_My_Sheet_ALL.xlsx waits until 6pm that day; rows already on the board are skipped.
