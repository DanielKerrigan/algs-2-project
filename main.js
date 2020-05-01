Promise.all([
  d3.csv('data/cars.csv', d3.autoType),
]).then(([carsDataset]) => {
  const cars = {
    'columns': Object.keys(carsDataset[0])
      .filter(d => d !== 'label' && d !== 'origin'),
    'data': carsDataset
  };

  manager([cars]);
});


function manager([cars]) {
  introduction(cars);
  edgeHistogram();
  edgeCrossingMatrix(cars);
}


function introduction(cars) {
  const cols = cars.columns.slice();

  const chart = parallel()
    .columns(cols)

  const div = d3.select('#pc1');
  const button = d3.select('#shuffle');

  div.datum(cars.data)
      .call(chart);

  button.on('click', function() {
    d3.shuffle(cols);
    chart.columns(cols);
    div.call(chart);
  });
}


function edgeHistogram() {
  const div = d3.select('#edge-histogram');
  histogramInteractive(div);
}


function edgeCrossingMatrix(cars) {
  const div = d3.select('#edge-crossing-matrix');
  const {counts, countsMap} = calculateEdgeCrossings(cars);

  div.select('tbody')
    .selectAll('tr')
    .data(counts.sort((a, b) => d3.ascending(a.crosses, b.crosses)))
    .join('tr')
      .call(tr => tr.append('td').text(d => d.axes[0]))
      .call(tr => tr.append('td').text(d => d.axes[1]))
      .call(tr => tr.append('td')
          .style('text-align', 'right')
          .text(d => d3.format(',')(d.crosses)));
}
