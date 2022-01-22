<script>
  import Pie from "svelte-chartjs/src/Pie.svelte";
  import Doughnut from "svelte-chartjs/src/Doughnut.svelte";
  import Bar from "svelte-chartjs/src/Bar.svelte";
  import Line from "svelte-chartjs/src/Line.svelte";
  import Scatter from "svelte-chartjs/src/Scatter.svelte";
  import Bubble from "svelte-chartjs/src/Bubble.svelte";
  import Polar from "svelte-chartjs/src/Polar.svelte";
  import HorizontalBar from "svelte-chartjs/src/HorizontalBar.svelte";
  import Radar from "svelte-chartjs/src/Radar.svelte";

  export let data;
  export let width = 450;
  export let height = 1200;
  export let options = { maintainAspectRatio: false, responsive: true };
  export let chartLayout;
</script>

{#if chartLayout === "donuts"}
  <Doughnut {data} {width} {height} {options} />
{:else if chartLayout === "bar"}
  <Bar {data} {width} {height} {options} />
{:else if chartLayout === "line"}
  <Line {data} {width} {height} {options} />
{:else if chartLayout === "scatter"}
  <Scatter {data} {width} {height} {options} />
{:else if chartLayout === "bubble"}
  <Bubble {data} {width} {height} {options} />
{:else if chartLayout === "polar"}
  <Polar {data} {width} {height} {options} />
{:else if chartLayout === "horizontalBar"}
  <HorizontalBar {data} {width} {height} {options} />
{:else if chartLayout === "radar"}
  <Radar {data} {width} {height} {options} />
{:else}
  <Pie {data} {width} {height} {options} />
{/if}
