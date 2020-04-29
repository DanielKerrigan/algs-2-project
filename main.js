Promise.all([
  d3.csv('data/cars.csv', d3.autoType),
]).then((datasets) => {
  manager(datasets);
});


function manager([cars]) {
  d3.select('#pc1')
      .datum(cars)
      .call(parallel());
}
