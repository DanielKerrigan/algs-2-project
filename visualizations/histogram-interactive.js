function histogramInteractive(div) {
  const size = 4;

  const totalWidth = 600;

  const section = d3.scaleBand()
      .domain([0, 1, 2])
      .range([0, totalWidth])
      .paddingInner(0);

  const margin = { top: 10, bottom: 10, left: 10, right: 10 };

  const width = section.bandwidth() - margin.left - margin.right;
  const height = section.bandwidth() - margin.top - margin.bottom;

  const x = d3.scaleBand()
    .domain(d3.range(size))
    .range([0, width]);
  
  const y = d3.scaleBand()
    .domain(d3.range(size))
    .range([0, height]);

  const svg = div.append('svg')
      .attr('width', totalWidth)
      .attr('height', section.bandwidth());

  const first = svg.append('g')
      .attr('transform', `translate(${section(0) + margin.left},${margin.top})`);
      
  const second = svg.append('g')
      .attr('transform', `translate(${section(1) + margin.left},${margin.top})`);

  const third = svg.append('g')
      .attr('transform', `translate(${section(2) + margin.left},${margin.top})`);

  let gram;

  reset();

  function reset() {
    gram = Array(size).fill(Array(size).fill(0));

    update();
  }

  function update() {
    // axes
    first.selectAll('.axis')
      .data([d3.range(size), d3.range(size)])
      .join('g')
        .attr('class', (d, i) => i === 0 ? 'axis left' : 'axis right')
        .attr('transform', (d, i) => `translate(${i === 0 ? x(0) : x(size - 1)},0)`)
      .selectAll('.cell')
        .data(d => d)
        .join(
          enter => enter.append('g')
            .attr('transform', (d, i) => `translate(0,${y(i)})`)
            .attr('class', 'cell')
            .call(
              g => g.append('rect')
                  .attr('fill', 'white')
                  .attr('stroke', 'black')
                  .attr('stroke-width', '1')
                  .attr('width', x.bandwidth())
                  .attr('height', y.bandwidth())
            )
        )

    // update grid
    const cells = second.selectAll('row')
      .data(gram)
      .join('g')
        .attr('class', 'row')
        .attr('transform', (d, i) => `translate(0,${y(i)})`)
      .selectAll('cell')
      .data(d => d)
      .join(
        enter => enter.append('g')
            .attr('class', 'cell')
            .attr('transform', (d, i) => `translate(${x(i)},0)`)
            .call(
              g => g.append('rect')
                  .attr('width', x.bandwidth())
                  .attr('height', y.bandwidth())
                  .attr('fill', 'none')
                  .attr('stroke', 'black')
                  .attr('stroke-width', 1)
            )
            .call(
              g => g.append('text')
                  .attr('font-size', y.bandwidth() / 2)
                  .attr('dominant-baseline', 'middle')
                  .attr('text-anchor', 'middle')
                  .attr('x', x.bandwidth() / 2)
                  .attr('y', y.bandwidth() / 2)
            )
      )

    cells.selectAll('text')
        .text(d => d);
  }
}
