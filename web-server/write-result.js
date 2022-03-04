const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: 'Result.csv',
  header: [
    {id: 'Image', title: 'Image'},
    {id: 'Results', title: 'Results'},
  ]
});

data =  [{Image:'test', Results:'paul'}]


function writeResult(Image, Results) {
  data = [{Image:Image, Results:Results}]
  csvWriter.writeRecords(data);
}

module.exports = { writeResult }