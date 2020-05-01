function histogramInteractive(div) {
  const size = 5;

  const totalWidth = 700;

  const section = d3.scaleBand()
      .domain([0, 1, 2])
      .range([0, totalWidth])
      .paddingInner(0.1);

  const margin = { top: 20, bottom: 20, left: 10, right: 10 };

  const width = section.bandwidth() - margin.left - margin.right;
  const height = section.bandwidth() - margin.top - margin.bottom;

  const x = d3.scaleBand()
    .domain(d3.range(size))
    .range([0, width]);
  
  const y = d3.scaleBand()
    .domain(d3.range(size))
    .range([height, 0]);

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
  let leftSelected;
  let rightSelected;
  let clickedRect;

  reset();
  firstSetup();
  secondSetup();
  thirdSetup();
  controlsSetup();
  update();

  function reset() {
    gram = Array(size);
    for (let i = 0; i < size; i++) {
      gram[i] = Array(size);
      for (let j = 0; j < size; j++) {
        gram[i][j] = {i, j, count: 0};
      }
    }
    
    leftSelected = -1;
    rightSelected = -1;
  }

  function firstSetup() {
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
            .attr('transform', (d) => `translate(0,${y(d)})`)
            .attr('class', 'cell')
            .call(
              g => g.append('rect')
                  .attr('fill', 'white')
                  .attr('stroke', 'black')
                  .attr('stroke-width', '1')
                  .attr('width', x.bandwidth())
                  .attr('height', y.bandwidth())
            )
        );

    const left = first.select('.left');
    const right = first.select('.right');

    left.append('text')
        .attr('x', x.bandwidth() / 2)
        .attr('y', -2)
        .attr('text-anchor', 'middle')
        .text('A');
   
    right.append('text')
        .attr('x', x.bandwidth() / 2)
        .attr('y', -2)
        .attr('text-anchor', 'middle')
        .text('B');

    left.selectAll('.cell')
      .on('click', function(d) {
        leftSelected = d;
        if (rightSelected !== -1) {
          gram[leftSelected][rightSelected].count += 1;
          update();
          leftSelected = -1;
          rightSelected = -1;
          clickedRect.attr('fill', 'white');
        } else {
          if (clickedRect) {
            clickedRect.attr('fill', 'white');
          }
          clickedRect = d3.select(this).select('rect');
          clickedRect.attr('fill', 'lightgray');
        }
      });
 
    right.selectAll('.cell')
      .on('click', function(d) {
        rightSelected = d;
        if (leftSelected !== -1) {
          gram[leftSelected][rightSelected].count += 1;
          update();
          leftSelected = -1;
          rightSelected = -1;
          clickedRect.attr('fill', 'white');
        } else {
          if (clickedRect) {
            clickedRect.attr('fill', 'white');
          }
          clickedRect = d3.select(this).select('rect');
          clickedRect.attr('fill', 'lightgray');
        }
      });
  }


  function secondSetup() {
    second.append('text')
        .attr('x', 0)
        .attr('y', height - y.bandwidth() / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .text('A↑');
    
    second.append('text')
        .attr('x', x.bandwidth() / 2)
        .attr('y', height + 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'hanging')
        .text('B→');
  }

  
  function thirdSetup() {
    third.append('text')
        .attr('fill', 'black')
        .text('Crossings = ')
      .append('tspan')
        .attr('id', 'histogram-num-crossings')
        .text('0');
  }


  function controlsSetup() {
    div.select('#reset-histogram')
      .on('click', function() {
        reset();
        update();
        updateLabel(0);
      });

    div.select('#random-histogram')
      .on('click', function() {
        reset();

        gram = Array(size);
        for (let i = 0; i < size; i++) {
          gram[i] = Array(size);
          for (let j = 0; j < size; j++) {
            const rand = Math.random() < (1 / 3) ? 1 : 0;
            gram[i][j] = {i, j, count: rand};
          }
        }

        update();
        updateLabel(0);
      });
 
    div.select('#calc-ec')
      .on('click', function() {
        calculateCrossings();
      });
  }


  async function calculateCrossings() {
    let crossings = 0;
    const sleepTime = 300;
    
    for (let i = 0; i < size; i++) {
      for (let j = size - 1; j >= 0; j--) {
        gram[i][j].square.attr('fill', 'lightblue');
        await sleep(sleepTime);
        if (gram[i][j].count !== 0) {
          for (let k = i + 1; k < size; k++) {
            for (let l = j - 1; l >= 0; l--) {
              gram[k][l].square.attr('fill', 'salmon');
              const num = (gram[i][j].count * gram[k][l].count);
              crossings += num;
              
              if (num > 0) {
                gram[k][l].square.attr('fill', 'lightgreen');
                await sleep(sleepTime);
                updateLabel(crossings);
              }

              await sleep(sleepTime);
              gram[k][l].square.attr('fill', 'white');
            }
          }
        }
        gram[i][j].square.attr('fill', 'white');
      }
    }
    updateLabel(crossings);
  }


  function updateLabel(n) {
    third.select('#histogram-num-crossings').text(n);
  }


  function update() {
    // lines
    const edges = d3.merge(gram).filter(d => d.count !== 0);

    first.selectAll('.edge')
      .data(edges)
      .join('line')
        .attr('class', 'edge')
        .attr('stroke', 'black')
        .attr('fill', 'none')
        .attr('stroke-width', d => d.count)
        .attr('x1', x(0) + (x.bandwidth() / 2))
        .attr('y1', d => y(d.i) + (y.bandwidth() / 2))
        .attr('x2', x(size - 1) + (x.bandwidth() / 2))
        .attr('y2', d => y(d.j) + (y.bandwidth() / 2));

    // grid
    second.selectAll('.row')
      .data(gram)
      .join('g')
        .attr('class', 'row')
        .attr('transform', (d, i) => `translate(0,${y(i)})`)
      .selectAll('.cell')
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
      ).each(function(d) {
        d.square = d3.select(this).select('rect');
      });

    second.selectAll('.cell')
      .select('text')
        .text(d => d.count);
  }
}

