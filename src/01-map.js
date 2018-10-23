import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }
let height = 600 - margin.top - margin.bottom
let width = 1100 - margin.left - margin.right

let svg = d3
  .select('#chart-1')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`)

let projection = d3.geoMercator()
let graticule = d3.geoGraticule()

let path = d3.geoPath().projection(projection)

let colorScale = d3.scaleSequential(d3.interpolateCool)

Promise.all([
  d3.json(require('./data/world.topojson')),
  d3.csv(require('./data/world-cities.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([json, datapoints]) {
  let countries = topojson.feature(json, json.objects.countries)

  // if you do this:
  // colorScale.domain(d3.extent(datapoints, d => +d.population))
  // then almost all the cities except the super large ones
  // will be of the same color
  // so set the domain manually to give not-crazily-large cities a shot
  // and then also set .clamp to be true so that
  // d3 doesn't make bad extrapolations for you
  colorScale.domain([0,700000]).clamp(true)

  svg
    .selectAll('.country')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', path)
    .attr('fill', '#070707')

  svg
    .append('path')
    .datum(graticule())
    .attr('d', path)
    .attr('stroke', 'gray')
    .attr('stroke-width', 0.5)
    .lower()

  svg
    .selectAll('.city')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('class', 'city')
    .attr('r', 0.8)
    .attr('transform', d => `translate(${projection([d.lng, d.lat])})`)
    .attr('fill', d => colorScale(d.population))
}
