// settings
let
  nodeCount = 25,
  nodeRadius = 25,
  distance = 100,
  alpha = .005,
  factor = 5,
  edgeCount = 1,
  impulse = .01,
  maxTime = 50,
  pause = false,
  pauseStep = false;

//framerate
let
  elapsed = 0,
  time = new Date().getTime(),
  nextFpsUpdate = 0,
  speed = 0;

const fpsElement = <HTMLAnchorElement>document.querySelector("#control #fps a");
const speedElement = <HTMLAnchorElement>document.querySelector("#control #speed a");

// html setup
const control = <HTMLDivElement>document.querySelector("#control")!;

// set node count
document.querySelector("#control #nodeCount input")!.addEventListener("input", ev => {
  const value = (<HTMLInputElement>ev.target).value;
  document.querySelector("#control #nodeCount a")!.innerHTML = value;
  nodeCount = Number(value);
  n = createNetwork(nodeCount, edgeCount);
  $step = gradientDesecent(n, distance, alpha);
  pauseStep = false;
});

// set node radius
document.querySelector("#control #nodeRadius input")!.addEventListener("input", ev => {
  const value = (<HTMLInputElement>ev.target).value;
  document.querySelector("#control #nodeRadius a")!.innerHTML = value;
  nodeRadius = Number(value);
});

// set distance
document.querySelector("#control #distance input")!.addEventListener("input", ev => {
  const value = (<HTMLInputElement>ev.target).value;
  document.querySelector("#control #distance a")!.innerHTML = value;
  distance = Number(value);
  $step = gradientDesecent(n, distance, alpha);
  pauseStep = false;
});

// set alpha
document.querySelector("#control #alpha input")!.addEventListener("input", ev => {
  const value = (<HTMLInputElement>ev.target).value;
  document.querySelector("#control #alpha a")!.innerHTML = value;
  alpha = Number(value);
  $step = gradientDesecent(n, distance, alpha);

  if (alpha === 0 && !pauseStep) {
    pauseStep = true;
    console.log("step paused");
  }
  if (pauseStep && alpha > 0) {
    pauseStep = false;
    console.log("step resumed");
  }
});

// set factor
document.querySelector("#control #factor input")!.addEventListener("input", ev => {
  const value = (<HTMLInputElement>ev.target).value;
  document.querySelector("#control #factor a")!.innerHTML = value;
  factor = Number(value);
  pauseStep = false;
});

// set edgeCount
document.querySelector("#control #edgeCount input")!.addEventListener("input", ev => {
  const value = (<HTMLInputElement>ev.target).value;
  document.querySelector("#control #edgeCount a")!.innerHTML = value;
  edgeCount = Number(value);
  n = createNetwork(nodeCount, edgeCount);
  $step = gradientDesecent(n, distance, alpha);
  pauseStep = false;
});

// set impulse
document.querySelector("#control #impulse input")!.addEventListener("input", ev => {
  const value = (<HTMLInputElement>ev.target).value;
  document.querySelector("#control #impulse a")!.innerHTML = value;
  impulse = Number(value);
});

// set maxTime
document.querySelector("#control #maxTime input")!.addEventListener("input", ev => {
  const value = (<HTMLInputElement>ev.target).value;
  document.querySelector("#control #maxTime a")!.innerHTML = value;
  maxTime = Number(value);
});

// set pause 
document.querySelector("#control #pause input")!.addEventListener("click", ev => {
  const value = (<HTMLInputElement>ev.target).checked;
  document.querySelector("#control #pause a")!.innerHTML = value + "";
  pause = value;
});

// reset positon button
document.querySelector("#control #resetPosition button")!.addEventListener("click", () => {
  n.nodes.forEach(node => {
    node.x = Math.random()*canvas.width, node.y = Math.random()*canvas.height;
  });
  pauseStep = false;
});

// shuffle button
document.querySelector("#control #shuffle button")!.addEventListener("click", () => {
  n.nodes.forEach(node => {
    if (Math.random() < .25)
      node.x = Math.random()*canvas.width, node.y = Math.random()*canvas.height;
  });
  pauseStep = false;
});


// canvas and context
const canvas = document.querySelector("canvas")!;
const ctx = canvas.getContext("2d")!;

// set canvas to fullscreen
canvas.width = document.body.clientWidth - control.clientWidth;
canvas.height = document.body.clientHeight;

// network
type Network = {
  nodes: NetworkNode[],
  edges: NetworkNode[][]
}
type NetworkNode = {
  x: number,
  y: number,
  state: number
};

// network
function createNetwork(nodeCount: number, edgeCount: number): Network {

  // nodes
  const nodes = Array<() => NetworkNode>(nodeCount).fill(() => ({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, state: 0 })).map(fn => fn());

  // edges
  const edges = Array<() => NetworkNode[]>(nodeCount).fill(() => []).map(fn => fn());

  for (let i=0; i<nodeCount; i++) {
    for (let j=0; j<edgeCount; j++) {
      let a = Math.floor(Math.random()*nodeCount);
      while (a === i) {
        a = Math.floor(Math.random()*nodeCount);
      }

      edges[i].push(nodes[a]);
      edges[a].push(nodes[i]);
    }
  }

  return { nodes, edges };
}

function neighbours(network: Network, node: NetworkNode) {
  return network.edges[network.nodes.indexOf(node)];
}

// state
function color(state: number) {
  const n = Math.floor((((state <= 0 ? 0 : state) / (maxTime * 1.05))) * 255);
  
  const hex1 = n.toString(16);
  const hex2 = (255 - n).toString(16);

  return "#" + (hex1.length < 2 ? "0" + hex1 : hex1) + (hex2.length < 2 ? "0" + hex2 : hex2) + "aa";
}

function $update(node: NetworkNode) {
  node.state -= 1;
}

function active({ state }: NetworkNode) {
  return state === maxTime;
}

function inactive({ state }: NetworkNode) {
  return state <= 0;
}

function $activate(node: NetworkNode) {
  if (inactive(node)) {
    // node.state = Math.floor(maxTime + Math.random()*(maxTime / 5));
    node.state = Math.floor(maxTime * 1.05);
  }
}

// drawing
function $draw({ x, y, state }: NetworkNode) {
  ctx.fillStyle = color(state);
  ctx.beginPath();
  ctx.arc(x, y, nodeRadius, 0, Math.PI*2);
  ctx.fill();
  ctx.stroke();
}

function $drawEdges(network: Network) {
  const { nodes, edges } = network;
  for (let i=0; i<nodes.length; i++) {
    const node = nodes[i];
    const ns = edges[i];
    for (let j=0; j<ns.length; j++) {
      const n = ns[j];
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.moveTo(node.x, node.y);
      ctx.lineTo(n.x, n.y);
      ctx.stroke();
    }
  }
}

function $reset() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

//positioning
function gradientDesecent(network: Network, distance: number, alpha: number) {
  const { nodes } = network;

  function gradP(n1: NetworkNode, n2: NetworkNode, d = distance) {
    const
      dx = n1.x - n2.x,
      dy = n1.y - n2.y,
      dis = Math.sqrt(dx*dx + dy*dy),
      x = d * dx / dis - dx,
      y = d * dy / dis - dy;
    return {
      x: isNaN(x) ? 0 : x,
      y: isNaN(y) ? 0 : y
    };
  }

  function grad(node: NetworkNode) {
    const sum = { x: 0, y: 0 };
    // for (const n2 of nodes) {
    // // for (const n2 of neighbours(network, node)) {
    //   const { x, y } = gradP(node, n2);
    //   sum.x += x;
    //   sum.y += y;
    // }
    const ns = neighbours(network, node);
    for (const n2 of nodes) {
      const isNeighbour = ns.includes(n2);
      const { x, y } = gradP(node, n2, isNeighbour ? distance : factor * distance);
      sum.x += x;
      sum.y += y;
    }
    return sum;
  }

  // step
  return function () {
    let sum = 1;
    for (const node of nodes) {
      const { x, y } = grad(node);
      node.x += alpha * x;
      node.y += alpha * y;
      sum += Math.abs(x) + Math.abs(y);
    }
    return sum;
  };
}

// logic
function $logic(network: Network) {
  $reset();
  $drawEdges(network);
  if (Math.random() < impulse) {
    $activate(network.nodes[Math.floor(Math.random() * network.nodes.length)]);
  }
  network.nodes.forEach(node => {
    if (active(node)) {
      neighbours(network, node).forEach($activate);
    }
    $update(node);
    $draw(node);
  });
  
  if (!pauseStep) {
    const sum = $step();
    if (sum < .01) {
      pauseStep = true;
      console.log("step paused");
    }
  }
}

// setup
let n = createNetwork(nodeCount, edgeCount);
let $step = gradientDesecent(n, distance, alpha);

function $animation() {
  const start = new Date().getTime();
  if (!pause) {
    $logic(n);
  }
  speed += (new Date().getTime() - start) / 60;
  const now = new Date().getTime();
  elapsed += (now - time) / 60;
  time = now;
  if (nextFpsUpdate === 0) {
    fpsElement.innerText = Math.round(1000 / elapsed) + "";
    elapsed = 0;
    speedElement.innerText = Math.round(speed * 1000) / 1000 + "";
    speed = 0;
  }
  nextFpsUpdate = nextFpsUpdate === 0 ? 60 : nextFpsUpdate - 1;
  window.requestAnimationFrame($animation);
}

$animation();