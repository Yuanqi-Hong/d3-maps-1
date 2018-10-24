import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 10, right: 0, bottom: 0 }
let height = 500 - margin.top - margin.bottom
let width = 910 - margin.left - margin.right

let svg = d3
  .select('#chart-5')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`)

let projection = d3.geoAlbersUsa()

let path = d3.geoPath().projection(projection)

let colorScale = d3
  .scaleOrdinal()
  .range([
    '#9e0142',
    '#d53e4f',
    '#f46d43',
    '#fdae61',
    '#fee08b',
    '#ffffbf',
    '#e6f598',
    '#abdda4',
    '#66c2a5',
    '#3288bd',
    '#5e4fa2'
  ])

let radiusScale = d3.scaleSqrt().range([0.5, 6])

Promise.all([
  d3.json(require('./data/us_states.topojson')),
  d3.csv(require('./data/powerplants.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([json, datapoints]) {
  console.log(datapoints)
  let states = topojson.feature(json, json.objects.us_states)
  projection.fitSize([width, height], states)

  radiusScale.domain(d3.extent(datapoints, d => d.Total_MW))

  svg
    .selectAll('.state')
    .data(states.features)
    .enter()
    .append('path')
    .attr('class', 'state')
    .attr('d', path)
    .attr('fill', '#070707')

  svg
    .selectAll('.powerplant')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('class', 'powerplant')
    .attr('r', d => radiusScale(d.Total_MW))
    .attr(
      'transform',
      d => `translate(${projection([d.Longitude, d.Latitude])})`
    )
    .attr('fill', d => colorScale(d.PrimSource))
    .attr('opacity', 0.5)

  let legend = svg.append('g').attr('transform','translate(50,50)')

  legend
    .selectAll('.legend-entry')
    .data(nested)
    .enter()
    .append('g')
    .attr('transform', (d, i) => `translate(0,${i * 20})`)
    .attr('class', 'legend-entry')
    .each(function(d) {
      let g = d3.select(this)

      g.append('circle')
        .attr('r', 5)
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('fill', colorScale(d.key))

      g.append('text')
        .text(d.key)
        .attr('dx', 10)
        .attr('alignment-baseline','middle')

      g.append('rect')
        .attr('x', -8)
        .attr('y', -9)
        .attr('width', 370)
        .attr('height', 14)
        .attr('fill', '#fcfcfc')
        .lower()

    })
}
