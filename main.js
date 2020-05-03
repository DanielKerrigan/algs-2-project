Promise.all([
  d3.csv('data/cars.csv', d3.autoType),
]).then(([carsDataset]) => {
  const cars = {
    'columns': Object.keys(carsDataset[0])
      .filter(d => d !== 'label' && d !== 'origin'),
    'data': carsDataset,
  };
  cars['crosses'] = calculateEdgeCrossings(cars);

  manager([cars]);
});


function manager([cars]) {
  introduction(cars);
  edgeHistogram();
  edgeCrossingMatrix(cars);
  osl2Demo(cars);
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
  const div = d3.select('#edge-crossing-table-vis');
  const vis = div.select('#axis-pair-vis');

  const counts = cars.crosses.counts;

  div.select('tbody')
    .selectAll('tr')
    .data(counts)
    .join('tr')
      .call(tr => tr.append('td').text(d => d.axes[0]))
      .call(tr => tr.append('td').text(d => d.axes[1]))
      .call(tr => tr.append('td')
          .style('text-align', 'right')
          .text(d => d3.format(',')(d.crosses)))
      .on('click', function (d) {
        d3.selectAll('.clicked')
          .classed('clicked', false);

        d3.select(this).classed('clicked', true);

        draw(d.axes);
      })
    .filter((d, i) => i === 0)
      .classed('clicked', true);

  const width = Math.max(vis.node().clientWidth, 400);
  const height = Math.max(vis.node().clientHeight, 400);

  const chart = pair()
      .width(width)
      .height(height);

  draw(counts[0].axes)

  function draw(axes) {
    chart.columns(axes);

    vis.datum(cars.data)
        .call(chart);
  }
}


function osl2Demo(cars) {
  const div = d3.select('#osl2');
  const pc = d3.select('#osl2pc');

  osl2Interactive(div, cars);

  const minOrder = [
    'horsepower',
    'displacement',
    'cylinders',
    'weight',
    'year',
    'mpg',
    'acceleration'
  ];

  const maxOrder = [
    'displacement',
    'acceleration',
    'horsepower',
    'mpg',
    'weight',
    'year',
    'cylinders'
  ];

  const chart = parallel().columns(minOrder);

  pc.selectAll('.osl2MinOrMax')
      .on('change', function () {
        chart.columns(this.value === 'min' ? minOrder : maxOrder);
        draw();
      })

  draw();

  function draw() {
    pc.datum(cars.data)
      .call(chart);
  }

}
