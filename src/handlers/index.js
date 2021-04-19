const connection = require('../connection');

async function fetchQuery(req, res) {
  console.log('----API.called----');
  const { cedule } = req.query;
  if (!cedule) {
    return res.status(400).json({ success: false, message: 'Invalid cedule' });
  }
  const query1 = `SELECT * FROM custom_654 WHERE Cedula = '${cedule}'`;
  try {
    const dbConn = await connection();

    const [exec] = await dbConn.query(query1);
    console.log('----API.executed----');
    console.dir(exec);
    res.status(200).json({
      success: true,
      data: { ...exec[0] },
    });
  } catch (error) {
    console.log('catch.error');
    console.error(error);
    return res.status(error.statusCode || 500).json({ success: false, error });
  }
}

module.exports = { fetchQuery };
