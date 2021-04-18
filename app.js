'use strict';

// Imports
const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const { Request } = require('mssql');
const connectToSql = require('./sql.conection');
connectToSql();
// Creating the express app
const app = express();

// Body parser
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

// Testing a route
app.get('/', (req, res) => {
  res.send('Hello');
});

// Register the routers
app.use('/api/v1/fetch-management-queue-weekly', fetchQueryDetails);
app.use('/api/v1/display-apt-slots', displayAptSlots);

async function fetchQueryDetails(req, res) {
  try {
    if (!req.query.BProfileID) {
      return res.status(400).json({
        status: false,
        message: 'BProfileID value not provided',
      });
    }
    const BProfileID = req.query.BProfileID;
    const query = `SELECT B.DEPT_ID, B.DEPT_name
      FROM  dbo.CQ_BUSINESS_PROFILES A, 
          dbo.CQ_BUSINESS_DEPARTMENTS B
      WHERE B.BPROFILE_ID = A.BPROFILE_ID  
        AND B.DEPT_is_active = 1
        AND B.DEPT_is_deleted = 0
        AND A.BPROFILE_ID = ${BProfileID};`;

    await connectToSql();
    const request = new Request();
    const { recordset: data } = await request.query(query);
    return res.status(200).json({ data, success: true });
  } catch (error) {
    console.log('catch.error');
    console.error(error);
    return res
      .status(error.statusCode || 500)
      .json({ error, status: false, message: error.message || 'Internal server error' });
  }
}

async function displayAptSlots(req, res) {
  try {
    if (!req.query.DeptID) {
      return res.status(400).json({
        status: false,
        message: 'DeptID value not provided',
      });
    }
    const DeptID = req.query.DeptID;
    const CurrentDate = process.env.CURRENT_DATA || moment().format('YYYY/MM/DD');
    const CurrentDateTime = process.env.CURRENT_DATA_TIME || moment().format('YYYY/MM/DD HH:mm:ss');

    const query1 = `DECLARE @CurrentDate date;
      DECLARE @DeptID BIGINT;
      DECLARE @CurrentDateTime datetime;

      SET @CurrentDate = '${CurrentDate}'
      SET @DeptID = ${DeptID}
      SET @CurrentDateTime = '${CurrentDateTime}'

      SELECT ISNULL(
        (SELECT QUEUE_ID
          FROM CQ_QUEUE 
          WHERE DEPT_ID = @DeptID 
          and @CurrentDate BETWEEN QUEUE_date_start and QUEUE_date_end),
        (SELECT QUEUE_ID
          From CQ_QUEUE 
          WHERE DEPT_ID = @DeptID
          and CONVERT(VARCHAR(10), QUEUE_date_start, 105) = CONVERT(VARCHAR(10), @CurrentDate, 105))) as QUEUE_ID;`;

    const query2 = `DECLARE @CurrentDate date;
      DECLARE @DeptID BIGINT;
      DECLARE @CurrentDateTime datetime;

      SET @CurrentDate = '${CurrentDate}'
      SET @DeptID = ${DeptID}
      SET @CurrentDateTime = '${CurrentDateTime}'
      
      SELECT  A.QUEUE_ID AS QueueID, A.ASTATUS_ID AS AStatusID, A.ABASED_ID AS ABasedID, A.QCS_ID AS CStatus, A.CPROFILE_ID AS ClientID,
        A.ABASED_peep AS Peep, A.ABASED_start_time AS StartTime, A.ABASED_finish_time as FinishTime,
        A.ABASED_manual_client_name AS ManualName, D.CLOGIN_username AS Username, E.CPHOTO_link AS ClientPhoto
      FROM CQ_QUEUE_APPT_BASED A
        LEFT JOIN CQ_CLIENT_PROFILES B ON B.CPROFILE_ID = A.CPROFILE_ID
        LEFT JOIN CQ_CLIENTS C ON B.CLIENT_ID = C.CLIENT_ID
        LEFT JOIN CQ_LOGIN_CLIENT D ON C.CLOGIN_ID = D.CLOGIN_ID
        LEFT JOIN CQ_CLIENT_PHOTOS E ON B.CPROFILE_ID = E.CPROFILE_ID
        RIGHT JOIN CQ_QUEUE F ON F.QUEUE_ID = A.QUEUE_ID
      WHERE F.DEPT_ID = @DeptID
        AND CONVERT(VARCHAR(10), F.QUEUE_date_start, 105) = CONVERT(VARCHAR(10), @CurrentDate, 105)
          ORDER BY A.ABASED_ID;`;

    const request = new Request();
    const { recordset: data1 } = await request.query(query1);
    const { recordset: data2 } = await request.query(query2);
    return res.status(200).json({ data: { data1, data2 }, success: true });
  } catch (error) {
    console.log('catch.error');
    console.error(error);
    return res
      .status(error.statusCode || 500)
      .json({ error, status: false, message: error.message || 'Internal server error' });
  }
}

// catch 404 and forward to error handler
app.use((err, res) => {
  console.error('---Route_not_found---');
  err.status = 'Url Not found!';
  err.statusCode = 404;
  return res.status(err.statusCode).json({ ...err });
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'dev' ? err : {};

  // render the error page
  return res.status(err.statusCode).json({ ...err });
});

// Exporting the app
module.exports = app;
