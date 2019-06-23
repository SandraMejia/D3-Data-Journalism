// Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 500;

// Define the chart's margins as an object
var chartMargin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
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

var chosenXAxis = 'age'
var chosenYAxis = 'smokes'

// function used for updating x-scale var upon click on axis label
function xScale(stateData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.8,
        d3.max(stateData, d => d[chosenXAxis]) * 1.2])
        .range([0, chartWidth]);
    return xLinearScale
}

// function used for updating y-scale var upon click on axis label
function yScale(stateData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(stateData, d => d[chosenYAxis]) * 0.8,
        d3.max(stateData, d => d[chosenYAxis]) * 1.2])
        .range([chartHeight, 0]);
    return yLinearScale
}

// function used for updating xAxis var upong click on axis label
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating yAxis var upong click on axis label
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}



// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis, stateLabelGroup) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    stateLabelGroup.transition()
        .duration(1000)
        .attr("x", d => { return newXScale(d[chosenXAxis]) })
        .attr("y", d => { return newYScale(d[chosenYAxis]) })

    return circlesGroup;
}


// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    if (chosenXAxis === "age") { var xLabel = "Age (Median)" }
    else if (chosenXAxis === "poverty") { var xLabel = "In Poverty (%)" }
    else if (chosenXAxis === "income") { var xLabel = "Household Income (Median)" }

    if (chosenYAxis === "obesity") { var yLabel = "Obese (%)" }
    else if (chosenYAxis === "smokes") { var yLabel = "Smokes (%)" }
    else if (chosenYAxis === "healthcare") { var yLabel = "Lacks Healthcare (%)" }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .attr("class", "d3-tip")
        .html(function (d) {
            return (`${d.state}<br>${xLabel}: ${d[chosenXAxis]}<br>${yLabel}: ${d[chosenYAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data);
    })
        // onmouseout event
        .on("mouseout", function (data) {
            toolTip.hide(data);
        });

    return circlesGroup;
}


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

    // xLinearScale and yLinearScale functions
    var xLinearScale = xScale(stateData, chosenXAxis);
    var yLinearScale = yScale(stateData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(stateData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .classed("stateCircle", true);
    // append initial labels
    var stateLabelGroup = chartGroup.append("text")
        .style("text-anchor", "middle")
        .selectAll("tspan")
        .data(stateData)
        .enter()
        .append("tspan")
        .attr("x", d => { return xLinearScale(d[chosenXAxis]) })
        .attr("y", d => { return yLinearScale(d[chosenYAxis]) })
        .text((data) => { return data.abbr })
        .classed("stateText", true);
    // updateToolTip function above csv import
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);




    // Create group for  3 x- axis labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);
    // Create group for  3 y- axis labels
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "age") // value to grab for event listener
        .classed("active", true)
        .text("Age (Median)");

    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "poverty") // value to grab for event listener
        .classed("inactive", true)
        .text("In Poverty (%)");

    var incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");


    var obesityLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - chartWidth / 2 - chartMargin.left)
        .attr("x", chartHeight / 2)
        .attr("dy", "1em")
        .attr("value", "obesity") // value to grab for event listener
        .classed("active", true)
        .text("Obese (%)");

    var smokesLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - chartWidth / 2 - chartMargin.left + 20)
        .attr("x", chartHeight / 2)
        .attr("dy", "1em")
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokes (%)");

    var healthcareLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - chartWidth / 2 - chartMargin.left + 40)
        .attr("x", chartHeight / 2)
        .attr("dy", "1em")
        .attr("value", "healthcare") // value to grab for event listener
        .classed("inactive", true)
        .text("Lacks Healthcare (5)");


    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function () {
            var value = d3.select(this).attr("value")
            if (value !== chosenXAxis) {
                chosenXAxis = value;
                xLinearScale = xScale(stateData, chosenXAxis);
                xAxis = renderXAxis(xLinearScale, xAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis, stateLabelGroup);
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    povertyLabel
                        .classed("inactive", true)
                        .classed("active", false)
                    incomeLabel
                        .classed("inactive", true)
                        .classed("active", false)
                } else if (chosenXAxis === "poverty") {
                    ageLabel
                        .classed("inactive", true)
                        .classed("active", false)
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    incomeLabel
                        .classed("inactive", true)
                        .classed("active", false)
                } else if (chosenXAxis === "income") {
                    ageLabel
                        .classed("inactive", true)
                        .classed("active", false)
                    povertyLabel
                        .classed("inactive", true)
                        .classed("active", false)
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false)
                }

            }
        })




    // y axis labels event listener
    ylabelsGroup.selectAll("text")
        .on("click", function () {
            var value = d3.select(this).attr("value")
            if (value !== chosenYAxis) {
                chosenYAxis = value;
                yLinearScale = yScale(stateData, chosenYAxis);
                yAxis = renderYAxis(yLinearScale, yAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis, stateLabelGroup);
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                if (chosenYAxis === "obesity") {
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    smokesLabel
                        .classed("inactive", true)
                        .classed("active", false)
                    healthcareLabel
                        .classed("inactive", true)
                        .classed("active", false)
                } else if (chosenYAxis === "smokes") {
                    obesityLabel
                        .classed("inactive", true)
                        .classed("active", false)
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    healthcareLabel
                        .classed("inactive", true)
                        .classed("active", false)
                } else if (chosenYAxis === "healthcare") {
                    healthcareLabel
                    obesityLabel
                        .classed("inactive", true)
                        .classed("active", false)
                    smokesLabel
                        .classed("inactive", true)
                        .classed("active", false)
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false)
                }

            }
        })








})

