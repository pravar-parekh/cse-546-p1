const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: 'Result.csv',
  header: [
    {id: 'Image', title: 'Image'},
    {id: 'Results', title: 'Results'},
  ],
  append:true
});

data =  [{Image:'test', Results:'paul'}]


function writeResult(Image, Result) {
  data = [{Image:Image, Results:Result}]
  csvWriter.writeRecords(data, {flags:'a'});
}

module.exports = { writeResult }