import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 5, left: 5, right: 5, bottom: 5 }
let height = 510 - margin.top - margin.bottom
let width = 910 - margin.left - margin.right

let svg = d3
  .select('#chart-4a')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .style('background-color', '#101010')
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`)

// note it's NOT geoAlbersUSA!
// when you see "... is not a function"
// you most likely have spelled it wrong
let projection = d3.geoAlbersUsa()

let path = d3.geoPath().projection(projection)

let colorScale = d3.scaleSequential(d3.interpolateRdBu)

let opacityScale = d3.scaleLinear().range([0.4, 1])

d3.json(require('./data/counties_with_election_data.topojson'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(json) {
  let counties = topojson.feature(json, json.objects.us_counties)

  projection.fitSize([width, height], counties)

  colorScale.domain([0, counties.features.length])

  // let marginExtent = d3.extent(
  //   counties.features,
  //   d => d.properties.clinton - d.properties.trump
  // )
  // colorScale.domain(marginExtent)

  let totalVotesArray = counties.features.map(
    d => d.properties.clinton + d.properties.trump
  )
  let sum = totalVotesArray.reduce((a, b) => a + b, 0)

  let maxPercent = d3.max(
    counties.features,
    d => (d.properties.clinton + d.properties.trump) / sum
  )
  opacityScale.domain([0, maxPercent])

  svg
    .selectAll('.county')
    .data(counties.features)
    .enter()
    .append('path')
    .attr('class', 'county')
    .attr('d', path)
    .attr('fill', d => {
      if (d.properties.state) {
        return colorScale(d.properties.clinton - d.properties.trump)
      } else {
        return '#606060'
      }
    })
    .attr('opacity', d => {
      if (d.properties.state) {
        return opacityScale((d.properties.clinton + d.properties.trump) / sum)
      }
    })
}
