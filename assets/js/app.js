// Define SVG area dimensions
var svgWidth = 680;
var svgHeight = 480;

// Define the chart's margins as an object
var chartMargin = {
    top: 30,
    right: 30,
    bottom: 40,
    left: 40
};

// Define dimensions of the chart area
var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

// Select body, append SVG area to it, and set the dimensions
var svg = d3.select("#scatter")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

// Append a group to the SVG area and shift ('translate') it to the right and to the bottom
var chartGroup = svg.append("g")
    .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);



// Load data from data.csv

d3.csv("../assets/data/data.csv").then((stateData, error) => {
    if (error) return console.warn(error);
    stateData.forEach(d => {
        d.poverty = +d.poverty;
        d.age = +d.age;
        d.income = +d.income;
        d.healthcare = +d.healthcare;
        d.obesity = +d.obesity;
        d.smokes = +d.smokes;
    })

    var xLinearScale = d3.scaleLinear()
        .domain([(d3.min(stateData, d => d.age)) - 2, d3.max(stateData, d => d.age) + 2])
        .range([0, chartWidth])
    var yLinearScale = d3.scaleLinear()
        .domain([(d3.min(stateData, d => d.smokes)) - 2, d3.max(stateData, d => d.smokes) + 2])
        .range([chartHeight, 0]);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
    chartGroup.append("g")
        .call(leftAxis);
    chartGroup.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis);

    var circles = chartGroup.selectAll("circle")
        .data(stateData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.age))
        .attr("cy", d => yLinearScale(d.smokes))
        .attr("r", 15)
        .classed("stateCircle", true)

    chartGroup.append("text")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .selectAll("tspan")
        .data(stateData)
        .enter()
        .append("tspan")
        .attr("x", (data) => { return xLinearScale(data.age - 0) })
        .attr("y", (data) => { return yLinearScale(data.smokes - 0.2) })
        .text((data) => { return data.abbr })
        .classed("stateText", true);

    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - chartMargin.left / 2 - 5)
        .attr("x", 0 - (svgHeight / 2))
        .attr("class", "axisText")
        .text("Smokes (%)");

    chartGroup.append("text")

        .attr("y", chartHeight + chartMargin.bottom - 5)
        .attr("x", chartWidth / 2)
        .attr("class", "axisText")
        .text("Age (Median)");

})




