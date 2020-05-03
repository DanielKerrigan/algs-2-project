function osl2Interactive(div, data) {
  let clusters;
  let axisToCluster;
  let actions;
  let done;
  let scoreList;
  // const scoreMap = new Map(scoreList.map(d => [d.pair, d]));

  const margin = { top: 10, bottom: 10, left: 10, right: 10 };

  const width = 900 - margin.left - margin.right;
  const height = 450 - margin.top - margin.bottom;

  const svg = div.append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const table = svg.append('g')
      .attr('transform', `translate(0,20)`);

  const ordering = svg.append('g')
      .attr('transform', 'translate(250,20)')

  const action = svg.append('g')
      .attr('transform', 'translate(500,20)');

  const color = d3.scaleOrdinal()
      .domain(d3.range(data.columns.length))
      .range(d3.schemeCategory10);

  const resetButton = div.select('#osl2Reset');

  resetButton
      .on('click', function() {
        reset();
        update();
      });

  const stepButton = div.select('#osl2Step');

  stepButton
    .on('click', function() {
      step();
    });

  table.append('text')
    .attr('font-weight', 'bold')
    .text('Axis Pairs:');

  ordering.append('text')
    .attr('font-weight', 'bold')
    .text('Axis Order:');

  action.append('text')
    .attr('font-weight', 'bold')
    .text('Action:');


  reset();
  update();


  function update() {
    updatePairs();
    updateOrdering();
    updateActions();
  }


  function updatePairs() {
    table.selectAll('.pairing')
      .data(scoreList)
      .join('text')
        .attr('class', 'pairing')
        .attr('text-decoration', d => d.used ? 'line-through' : 'none')
        .attr('y', (d, i) => (i + 1) * 17)
        .text(d => d.pair);
  }


  function updateOrdering() {
    ordering.selectAll('.axis')
      .data(clusters.flat(), d => d)
      .join(
        enter => enter.append('text')
            .attr('class', 'axis')
            .attr('y', (d, i) => (i + 1) * 17)
            .attr('fill', d => color(axisToCluster.get(d)))
            .text(d => d),
        update => update
            .attr('fill', d => color(axisToCluster.get(d)))
            .call(text => text.transition()
                .duration(500)
                .attr('y', (d, i) => (i + 1) * 17)),
        exit => exit.remove()
      );
  }


  function updateActions() {
    action.selectAll('.action')
      .data(actions)
      .join('text')
        .attr('class', 'action')
        .attr('y', (d, i) => (i + 1) * 17)
        .text(d => d);
  }


  function reset() {
    scoreList = data.crosses.counts.map(d => ({...d, used: false}));
    actions = [];
    clusters = data.columns.map(d => [d]);
    axisToCluster = new Map(data.columns.map((d, i) => [d, i]));
    done = false;
    stepButton.attr('disabled', null);
  }


  async function step() {
    stepButton.attr('disabled', true);

    for (let i = 0; i < scoreList.length; i++) {
      const pair = scoreList[i];
      if (!pair.used) {
        pair.used = true;

        const [axis1, axis2] = pair.axes;

        const ends = getEnds();
        const i = axisToCluster.get(axis1);
        const j = axisToCluster.get(axis2);

        if (ends.has(axis1) && ends.has(axis2) && i !== j) {
          const ci = clusters[i];
          const cj = clusters[j];

          cj.forEach(a => {
            axisToCluster.set(a, i);
          });

          clusters[j] = [];

          if (ci[0] === axis1 && cj[0] === axis2) {
            clusters[i] = cj.reverse().concat(ci);
          } else if (ci[ci.length - 1] === axis1 && cj[0] === axis2) {
            clusters[i] = ci.concat(cj);
          } else if (ci[0] === axis1 && cj[cj.length - 1] === axis2) {
            clusters[i] = cj.concat(ci);
          } else {
            clusters[i] = ci.concat(cj.reverse());
          }

          actions.push(`Join ${axis1} and ${axis2}`);

          if (clusters[i].length === data.columns.length) {
            actions.push(`Done`);
            done = true;
          } else {
            stepButton.attr('disabled', null);
          }

          update();

          return;
        } else {
          actions.push(`Cannot join ${axis1} and ${axis2}`);
          updatePairs();
          updateActions();
          await sleep(1500);
        }
      }
    }

    function getEnds() {
      const ends = new Set();

      clusters.forEach(c => {
        n = c.length;
        if (n === 0) {
          return;
        }

        ends.add(c[0]);

        if (n > 1) {
          ends.add(c[n - 1]);
        }
      });

      return ends;
    }
  }
}
