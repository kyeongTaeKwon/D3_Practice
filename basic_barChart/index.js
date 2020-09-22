const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("width", 600)
  .attr("height", 600);

// svg
//   .append("rect")
//   .attr("width", "100%")
//   .attr("height", "100%")
//   .attr("fill", "pink");

const margin = { top: 20, right: 20, bottom: 100, left: 100 };
const graphWidth = 600 - margin.left - margin.right;
const graphHeight = 600 - margin.top - margin.bottom;

const graph = svg
  .append("g")
  .attr("width", graphWidth)
  .attr("height", graphHeight)
  .attr("transform", `translate(${margin.left},${margin.top})`);

const xAxisGroup = graph
  .append("g")
  .attr("transform", `translate(0,${graphHeight})`);
const yAxisGroup = graph.append("g");

xAxisGroup
  .selectAll("text")
  .attr("transform", "rotate(-40)")
  .attr("text-anchor", "end")
  .attr("fill", "red");

const y = d3.scaleLinear().range([graphHeight, 0]);
const x = d3.scaleBand().range([0, 500]).paddingInner(0.2).paddingOuter(0.2);

const xAxis = d3.axisBottom(x);
const yAxis = d3
  .axisLeft(y)
  .ticks(10)
  .tickFormat(d => d + " orders");

const update = data => {
  const min = d3.min(data, d => d.orders);
  const max = d3.max(data, d => d.orders);
  const extent = d3.extent(data, d => d.orders);

  y.domain([0, d3.max(data, d => d.orders)]);
  x.domain(data.map(item => item.name));

  const rects = graph.selectAll("rect").data(data);
  //exit selection을 지운다 .=> dom내부에서 필요없어진 엘리먼트를 제거
  rects.exit().remove();

  //현재 Dom 요소와 비교해서 업데이트
  rects
    .attr("width", x.bandwidth())
    .attr("fill", "orange")
    .attr("x", d => x(d.name))
    .transition()
    .duration(500)
    .attr("y", d => y(d.orders))
    .attr("height", d => graphHeight - y(d.orders));
  //현재 Dom 요소와 비교해서 없다면 엘리먼트 추가
  rects
    .enter()
    .append("rect")
    .attr("width", x.bandwidth())
    .attr("height", 0)
    .attr("fill", "orange")
    .attr("x", d => x(d.name))
    .attr("y", graphHeight)
    .merge(rects)
    .transition()
    .duration(500)
    .attrTween("width", widthTween)
    .attr("y", d => y(d.orders))
    .attr("height", d => graphHeight - y(d.orders));

  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);
};
const data = [];

db.collection("dishes").onSnapshot(res => {
  res.docChanges().forEach(change => {
    const doc = { ...change.doc.data(), id: change.doc.id };

    switch (change.type) {
      case "added":
        data.push(doc);
        break;
      case "modified":
        const index = data.findIndex(item => item.id === doc.id);
        data[index] = doc;
        break;
      case "removed":
        data = data.filter(item => item.id !== doc.id);
        break;
      default:
        break;
    }
  });
  update(data);
});

const widthTween = () => {
  let i = d3.interpolate(0, x.bandwidth());

  return t => i(t);
};
