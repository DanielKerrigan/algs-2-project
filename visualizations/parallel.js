/*
 * Parallel Coordinates
 *
 * References:
 * https://observablehq.com/@d3/parallel-coordinates
 */


function parallel() {
  let margin = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50
  };

  let width = 800 - margin.left - margin.right;
  let height = 500 - margin.top - margin.bottom;
  let columns = [];

  let color = '#5C068C';

  function chart(selection) {
    selection.each(function(dataset) {

      if (columns.length === 0) {
        columns = Object.keys(dataset[0])
          .filter(d => d !== 'label');
      }

      const data = dataset.map(d => {
        const vals = columns.map(c => ({key: c, value: d[c]}));
        vals.label = d.label;
        return vals;
      });

      const extent = new Map(columns.map(c => [c, d3.extent(dataset, d => d[c])]));

      const x = d3.scalePoint()
          .domain(columns)
          .range([0, width]);

      const y = new Map(columns.map(c => {
        const scale = d3.scaleLinear()
           .domain(extent.get(c)).nice()
           .rangeRound([height, 0]);
        return [c, scale]
      }))

      const svg = d3.select(this)
        .selectAll('.parallel')
        .data([data])
        .join(enter => enter.append('svg')
            .attr('class', 'parallel')
            .call(
              svg => svg.append('g')
                  .attr('class', 'vis-container')
                  .call(
                    g => g.append('g')
                        .attr('class', 'lines')
                  )
                  .call(
                    g => g.append('g')
                        .attr('class', 'axes')
                        .call(h => h.append('g').attr('class', 'y-axes'))
                        .call(h => h.append('g').attr('class', 'x-axis'))
                  )
                  .call(
                    g => g.append('g')
                        .attr('class', 'tooltip')
                        .attr('font-size', '12px')
                        .attr('pointer-events', 'none')
                  )
            ));

      svg.attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom);

      const g = svg.select('.vis-container')
          .attr('transform', `translate(${margin.left},${margin.top})`)
      const axesGroup = g.select('.axes');

      const line = d3.line()
          .x(d => x(d.key))
          .y(d => y.get(d.key)(d.value));

      g.select('.lines')
        .selectAll('.line')
        .data(data, d => d.label)
        .join('path')
          .attr('class', 'line')
          .attr('d', line)
          .attr('stroke', color)
          .attr('fill', 'none')
          .attr('stroke-opacity', 0.8);

      const yAxes = columns.map(c => ({
        column: c,
        axis: d3.axisLeft(y.get(c))
            .ticks(5)
      }));

      axesGroup.select('.y-axes')
        .selectAll('.y-axis')
        .data(yAxes, d => d.column)
        .join('g')
          .attr('class', 'y-axis')
          .attr('transform', d => `translate(${x(d.column)},0)`)
          .each(function(d, i) {
            d3.select(this)
                .call(d.axis)
                .call(g => {
                  if (g.selectAll('.tick .halo').empty()) {
                    g.selectAll('.tick text')
                      .clone(true)
                      .lower()
                        .attr('fill', 'none')
                        .attr('stroke', 'white')
                        .attr('stroke-width', '3')
                        .attr('stroke-linecap', 'round')
                        .attr('class', 'halo')
                  }
                })
          });

      axesGroup.select('.x-axis')
          .attr('transform', `translate(0,0)`)
          .call(d3.axisTop(x).tickSize(0).tickPadding(10))
          .call(g => g.select('.domain').remove());

    });
  }

  chart.width = function(w) {
    if (!arguments.length) return w;
    width = w - margin.left - margin.right;
    return chart;
  }
  
  chart.height = function(h) {
    if (!arguments.length) return h;
    height = h - margin.top - margin.bottom;
    return chart;
  }
  
  chart.columns = function(c) {
    if (!arguments.length) return c;
    columns = c;
    return chart;
  }

  return chart;
}
