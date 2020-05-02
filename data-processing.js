function calculateEdgeCrossings({columns, data}) {
  const namePairs = d3.cross(columns, columns)
      .filter(d => d[0] < d[1]);

  const counts = namePairs.map(([a, b]) => {
    let crosses = 0;
    const N = data.length;

    for (let i = 0; i < N; i++) {

      const li = data[i][a];
      const ri = data[i][b];

      for (let j = i; j < N; j++) {

        const lj = data[j][a];
        const rj = data[j][b];

        if ((li < lj && ri > rj) || (li > lj && ri < rj)) {
          crosses++;
        }
      }
    }

    return {
      axes: [a, b],
      crosses,
      pair: `${a}-${b}`,
    };
  });

  counts.sort((a, b) => d3.ascending(a.crosses, b.crosses));

  const countsMap = new Map(counts.map(d => {
    return [d.pair, d.crosses]
  }))

  return {counts, countsMap};
}
