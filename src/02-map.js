import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 40, left: 20, right: 20, bottom: 0 }
let height = 600 - margin.top - margin.bottom
let width = 1000 - margin.left - margin.right

let svg = d3
  .select('#chart-2')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`)

let projection = d3.geoEqualEarth()

let path = d3.geoPath().projection(projection)

let coordinateStore = d3.map()

Promise.all([
  d3.json(require('./data/world.topojson')),
  d3.csv(require('./data/airport-codes-subset.csv')),
  d3.csv(require('./data/flights.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([json, coordinateData, flights]) {
  coordinateData.forEach(d => {
    let name = d.iata_code
    let coords = [d.longitude, d.latitude]
    coordinateStore.set(name, coords)
  })

  let countries = topojson.feature(json, json.objects.countries)

  svg
    .append('path')
    .datum({ type: 'Sphere' })
    .attr('d', path)
    .attr('fill', '#9BDDFF')

  svg
    .selectAll('.country')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', path)
    .attr('fill', '#070707')

  svg
    .selectAll('.airport')
    .data(coordinateData)
    .enter()
    .append('circle')
    .attr('class', 'airport')
    .attr('r', 1.5)
    .attr(
      'transform',
      d => `translate(${projection([d.longitude, d.latitude])})`
    )
    .attr('fill', 'white')

  svg
    .selectAll('.flightPath')
    .data(flights)
    .enter()
    .append('path')
    .attr('class', 'flightPath')
    .attr('d', d => {
      let fromCoords = [-73.78, 40.64]

      let toCoords = coordinateStore.get(d.code)

      let geoLine = {
        type: 'LineString',
        coordinates: [fromCoords, toCoords]
      }

      return path(geoLine)
    })
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('stroke-width', 0.7)
}
