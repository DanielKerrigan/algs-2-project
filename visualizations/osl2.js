function osl2Interactive(div, data) {
  let index = 0;
  const states = getStates();

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

  const backButton = div.select('#osl2Back');
  const forwardButton = div.select('#osl2Forward');
  const resetButton = div.select('#osl2Reset');

  resetButton
      .on('click', function() {
        reset();
      });

  forwardButton
    .on('click', function() {
      if (index < states.length - 1) {
        index++;
        update(states[index]);
      }
    });

  backButton
    .on('click', function() {
      if (index > 0) {
        index--;
        update(states[index]);
      }
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


  function reset() {
    index = 0;
    update(states[index]);
  }


  function update(state) {
    updatePairs(state);
    updateOrdering(state);
    updateActions(state);
  }


  function updatePairs(state) {
    table.selectAll('.pairing')
      .data(state.scoreList)
      .join('text')
        .attr('class', 'pairing')
        .attr('fill', d => d.used ? 'silver' : 'black')
        .attr('y', (d, i) => (i + 1) * 17)
        .text(d => d.pair);
  }


  function updateOrdering(state) {
    ordering.selectAll('.axis')
      .data(state.clusters.flat(), d => d)
      .join(
        enter => enter.append('text')
            .attr('class', 'axis')
            .attr('y', (d, i) => (i + 1) * 17)
            .attr('fill', d => color(state.axisToCluster.get(d)))
            .text(d => d),
        update => update
            .attr('fill', d => color(state.axisToCluster.get(d)))
            .call(text => text.transition()
                .duration(750)
                .attr('y', (d, i) => (i + 1) * 17)),
        exit => exit.remove()
      );
  }


  function updateActions(state) {
    action.selectAll('.action')
      .data(state.actions)
      .join('text')
        .attr('class', 'action')
        .attr('y', (d, i) => (i + 1) * 17)
        .text(d => d);
  }

  function getStates() {
    const N = data.crosses.counts.length;

    const states = [
      {
        scoreList: data.crosses.counts.map(d => ({...d, used: false})),
        actions: [],
        clusters: data.columns.map(d => [d]),
        axisToCluster: new Map(data.columns.map((d, i) => [d, i])),
      }
    ];

    for (let pos = 0; pos < N; pos++) {
      const prevState = states[pos];
      const nextState = {
        scoreList: prevState.scoreList.map(d => ({...d})),
        actions: prevState.actions.slice(),
        clusters: prevState.clusters.map(d => d.slice()),
        axisToCluster: new Map(prevState.axisToCluster),
      };

      states.push(nextState);

      const pair = nextState.scoreList[pos];
      pair.used = true;

      const [axis1, axis2] = pair.axes;

      const ends = getEnds(nextState.clusters);
      const i = nextState.axisToCluster.get(axis1);
      const j = nextState.axisToCluster.get(axis2);

      if (ends.has(axis1) && ends.has(axis2) && i !== j) {
        const ci = nextState.clusters[i];
        const cj = nextState.clusters[j];

        cj.forEach(a => {
          nextState.axisToCluster.set(a, i);
        });

        nextState.clusters[j] = [];

        if (ci[0] === axis1 && cj[0] === axis2) {
          nextState.clusters[i] = cj.reverse().concat(ci);
        } else if (ci[ci.length - 1] === axis1 && cj[0] === axis2) {
          nextState.clusters[i] = ci.concat(cj);
        } else if (ci[0] === axis1 && cj[cj.length - 1] === axis2) {
          nextState.clusters[i] = cj.concat(ci);
        } else {
          nextState.clusters[i] = ci.concat(cj.reverse());
        }

        nextState.actions.push(`Join ${axis1} and ${axis2}`);

        if (nextState.clusters[i].length === data.columns.length) {
          nextState.actions.push(`Done`);
          break;
        }
      } else {
        nextState.actions.push(`Cannot join ${axis1} and ${axis2}`);
      }
    }

    return states;

    function getEnds(clusters) {
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
