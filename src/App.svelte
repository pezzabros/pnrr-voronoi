<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import * as d3VT from 'd3-voronoi-treemap'

	let width = 500;
	let height = 500;

	let color = d3.scaleOrdinal(['#7F3C8D','#11A579','#3969AC','#F2B701','#E73F74','#80BA5A','#E68310'])
	
	let el;
	export let legend = []

	export let tooltipX = 0
	export let tooltipY = 0
	export let tooltipLabel = ''
	export let tooltipValue = ''

	onMount(async () => {

		let PNNTData = await d3.csv("https://raw.githubusercontent.com/sapomnia/Piano-nazionale-di-ripartenza-e-resilienza/main/PNRR.csv", (obj) => 
                  ({...obj,
                     value: parseFloat(obj['Spesa (mld €)'].replace(',','.'))
                   }))
	
		let groupedData = d3.group(PNNTData, d => d['Missione'], d => d['Componenti'], d=> d['Investimenti e riforme'])
		legend = Array.from(groupedData.keys())
		let rootNode = d3.hierarchy(groupedData)
		let weightAccessor = (d) => d.value; // computes the weight of one of your data; depending on your data, it may be 'd.area', or 'd.percentage', ...
		
		rootNode.sum(weightAccessor)
		
		let computeCirclingPolygon = (radius) => {
			var _2PI = 2*Math.PI
			var points = 180,
					increment = _2PI/points,
					circlingPolygon = [];
			
			for (var a=0, i=0; i<points; i++, a+=increment) {
				circlingPolygon.push(
					[radius + radius*Math.cos(a), radius + radius*Math.sin(a)]
				)
			}
			
			return circlingPolygon;
		}

		let circlingPolygon = computeCirclingPolygon(245);

		let voronoiTreemap = d3VT.voronoiTreemap().clip(
			circlingPolygon
			/*[
			[0, 0],
			[0, height],
			[width, height],
			[width, 0],
			]*/
		);

		voronoiTreemap(rootNode)

		let allNodes = rootNode.descendants();
		let leaves = rootNode.leaves()

		let tooltip = d3.select(el)
			.append("text")
			.attr("class", "tooltip")
			.style("font-size", "9px")
			.attr("text-anchor", "middle")

		d3.select(el)
			.selectAll('path')
			.data(leaves)
			.enter()
			.append('path')
			.attr('d', function (d) {
				// d is a node
				return d3.line()(d.polygon) + 'z'; // d.polygon is the computed Voronoï cell encoding the relative weight of your underlying original data
			})
			.style('fill', function (d) {
				if(d.depth == 4)
					return color(d.parent.parent.parent.data[0])
				else
					return 'white'
			})
			.style('opacity', 0.7)
			.style('stroke-width', d => {
				return d.depth > 2 ? 1 : 2
			})
			.style('stroke', '#ffffff')
			.attr("transform", "translate(3,3)")
			.on("mouseover", function(e, d) {
				let pos = d3.polygonCentroid(d.polygon)
				d3.select(this).style('opacity', 1)
				tooltipX = pos[0]
				tooltipY = pos[1]
				tooltipLabel = d.data['Investimenti e riforme']
				tooltipValue = d.data['value'] + '(mld €)'
			})
			.on("mouseout", function(e, d) {
				tooltipLabel = ''
				tooltipValue = ''
				d3.select(this).style('opacity', 0.7)
			})

	});

</script>
<main>
	<h1>Dove verranno allocati i fondi del Piano Nazionale di Ripartenza e Resilienza?</h1>
	<div class="chart">
		<svg bind:this={el} viewBox="[0 0 {width} {height}]"></svg>
		<div class="tooltip" style="top: {tooltipY}px; left:{tooltipX}px">{tooltipLabel}<div class="value">{tooltipValue}</div></div>
	</div>
	<div class="legend">
		{#if legend.length}
			{#each legend as g}
			<div class="legend-item"><div class="dot" style="background-color: {color(g)}"></div>{g}</div>
			{/each}
		{/if}
	</div>
	<footer>
		<div>Made with ❤️ for 🇮🇹  by <a href="https://twitter.com/pezzabros">Daniele Pezzatini(@pezzabros)</div>
		<div>Data from <a href="https://github.com/sapomnia/Piano-nazionale-di-ripartenza-e-resilienza/blob/main/PNRR.csv">@sapomnia.</a></div>
		<div>Chart inspired by this <a href="https://www.nytimes.com/2021/04/28/upshot/biden-families-plan-american-rescue-infrastructure.html">New York Times article.</a></div>
		<div>Crafted with Svelte, D3, and D3 Voronoi Treemap. <a href="https://rawgraphs.io/">RawGraphs</a> for data exploration.</div>
		<div><a href="https://en.wikipedia.org/wiki/Voronoi_diagram">ℹ️  What is a Voronoi diagram?</a></div>
	</footer>
</main>


<style>
	main {
		text-align: center;
		padding: 1em;
		margin: 0 auto;
	}
	.chart {
		position: relative;
    width: 500px;
    height: 500px;
    margin: auto;
		padding: 2em

	}
	.tooltip {
		position:absolute;
		font-size: 12px;
		max-width: 150px;
		width: 150px;
		color: #000;
		transform: translate(-25%, -25%);
		text-align: center;
		pointer-events:none;
	}
	.tooltip .value{
		margin-left: 1em;
		font-weight: bold;
	}
	svg {
		width: 500px;
		height: 500px;
	}
	.legend {
		width: 500px;
		max-width: 500px;
		margin: 10px auto;
	}
	.legend-item {
		display: flex;
		align-items: center;
		flex-wrap: nowrap;
		margin-right: 10px;
		height: 1.5em;
		
	}
	.dot{
		width: 1em;
		min-height: 1em;
		max-height: 1em;
		border-radius: 50%;
		margin-right: 5px;
	}
	h1 {
		font-size: 1.8em;
		font-weight: 400;
		width: 690px;
		margin: auto;
	}

	footer {
		margin: 30px auto;
		border-top: 1px solid #444;
		padding-top: 30px;
		width: 500px

	}
	footer div {
		color: #444;
		font-size: 0.8em;
		line-height: 1.5em;
	}

</style>