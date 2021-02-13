"use strict";
// settings
var nodeCount = 25, nodeRadius = 25, distance = 100, alpha = .005, factor = 5, edgeCount = 1, impulse = .01, maxTime = 50, pause = false, pauseStep = false;
//framerate
var elapsed = 0, time = new Date().getTime(), nextFpsUpdate = 0, speed = 0;
var fpsElement = document.querySelector("#control #fps a");
var speedElement = document.querySelector("#control #speed a");
// html setup
var control = document.querySelector("#control");
// set node count
document.querySelector("#control #nodeCount input").addEventListener("input", function (ev) {
    var value = ev.target.value;
    document.querySelector("#control #nodeCount a").innerHTML = value;
    nodeCount = Number(value);
    n = createNetwork(nodeCount, edgeCount);
    $step = gradientDesecent(n, distance, alpha);
    pauseStep = false;
});
// set node radius
document.querySelector("#control #nodeRadius input").addEventListener("input", function (ev) {
    var value = ev.target.value;
    document.querySelector("#control #nodeRadius a").innerHTML = value;
    nodeRadius = Number(value);
});
// set distance
document.querySelector("#control #distance input").addEventListener("input", function (ev) {
    var value = ev.target.value;
    document.querySelector("#control #distance a").innerHTML = value;
    distance = Number(value);
    $step = gradientDesecent(n, distance, alpha);
    pauseStep = false;
});
// set alpha
document.querySelector("#control #alpha input").addEventListener("input", function (ev) {
    var value = ev.target.value;
    document.querySelector("#control #alpha a").innerHTML = value;
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
document.querySelector("#control #factor input").addEventListener("input", function (ev) {
    var value = ev.target.value;
    document.querySelector("#control #factor a").innerHTML = value;
    factor = Number(value);
    pauseStep = false;
});
// set edgeCount
document.querySelector("#control #edgeCount input").addEventListener("input", function (ev) {
    var value = ev.target.value;
    document.querySelector("#control #edgeCount a").innerHTML = value;
    edgeCount = Number(value);
    n = createNetwork(nodeCount, edgeCount);
    $step = gradientDesecent(n, distance, alpha);
    pauseStep = false;
});
// set impulse
document.querySelector("#control #impulse input").addEventListener("input", function (ev) {
    var value = ev.target.value;
    document.querySelector("#control #impulse a").innerHTML = value;
    impulse = Number(value);
});
// set maxTime
document.querySelector("#control #maxTime input").addEventListener("input", function (ev) {
    var value = ev.target.value;
    document.querySelector("#control #maxTime a").innerHTML = value;
    maxTime = Number(value);
});
// set pause 
document.querySelector("#control #pause input").addEventListener("click", function (ev) {
    var value = ev.target.checked;
    document.querySelector("#control #pause a").innerHTML = value + "";
    pause = value;
});
// reset positon button
document.querySelector("#control #resetPosition button").addEventListener("click", function () {
    n.nodes.forEach(function (node) {
        node.x = Math.random() * canvas.width, node.y = Math.random() * canvas.height;
    });
    pauseStep = false;
});
// shuffle button
document.querySelector("#control #shuffle button").addEventListener("click", function () {
    n.nodes.forEach(function (node) {
        if (Math.random() < .25)
            node.x = Math.random() * canvas.width, node.y = Math.random() * canvas.height;
    });
    pauseStep = false;
});
// canvas and context
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
// set canvas to fullscreen
canvas.width = document.body.clientWidth - control.clientWidth;
canvas.height = document.body.clientHeight;
// network
function createNetwork(nodeCount, edgeCount) {
    // nodes
    var nodes = Array(nodeCount).fill(function () { return ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, state: 0 }); }).map(function (fn) { return fn(); });
    // edges
    var edges = Array(nodeCount).fill(function () { return []; }).map(function (fn) { return fn(); });
    for (var i = 0; i < nodeCount; i++) {
        for (var j = 0; j < edgeCount; j++) {
            var a = Math.floor(Math.random() * nodeCount);
            while (a === i) {
                a = Math.floor(Math.random() * nodeCount);
            }
            edges[i].push(nodes[a]);
            edges[a].push(nodes[i]);
        }
    }
    return { nodes: nodes, edges: edges };
}
function neighbours(network, node) {
    return network.edges[network.nodes.indexOf(node)];
}
// state
function color(state) {
    var n = Math.floor((((state <= 0 ? 0 : state) / (maxTime * 1.05))) * 255);
    var hex1 = n.toString(16);
    var hex2 = (255 - n).toString(16);
    return "#" + (hex1.length < 2 ? "0" + hex1 : hex1) + (hex2.length < 2 ? "0" + hex2 : hex2) + "aa";
}
function $update(node) {
    node.state -= 1;
}
function active(_a) {
    var state = _a.state;
    return state === maxTime;
}
function inactive(_a) {
    var state = _a.state;
    return state <= 0;
}
function $activate(node) {
    if (inactive(node)) {
        // node.state = Math.floor(maxTime + Math.random()*(maxTime / 5));
        node.state = Math.floor(maxTime * 1.05);
    }
}
// drawing
function $draw(_a) {
    var x = _a.x, y = _a.y, state = _a.state;
    ctx.fillStyle = color(state);
    ctx.beginPath();
    ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
}
function $drawEdges(network) {
    var nodes = network.nodes, edges = network.edges;
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var ns = edges[i];
        for (var j = 0; j < ns.length; j++) {
            var n_1 = ns[j];
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(n_1.x, n_1.y);
            ctx.stroke();
        }
    }
}
function $reset() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
//positioning
function gradientDesecent(network, distance, alpha) {
    var nodes = network.nodes;
    function gradP(n1, n2, d) {
        if (d === void 0) { d = distance; }
        var dx = n1.x - n2.x, dy = n1.y - n2.y, dis = Math.sqrt(dx * dx + dy * dy), x = d * dx / dis - dx, y = d * dy / dis - dy;
        return {
            x: isNaN(x) ? 0 : x,
            y: isNaN(y) ? 0 : y
        };
    }
    function grad(node) {
        var sum = { x: 0, y: 0 };
        // for (const n2 of nodes) {
        // // for (const n2 of neighbours(network, node)) {
        //   const { x, y } = gradP(node, n2);
        //   sum.x += x;
        //   sum.y += y;
        // }
        var ns = neighbours(network, node);
        for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
            var n2 = nodes_1[_i];
            var isNeighbour = ns.includes(n2);
            var _a = gradP(node, n2, isNeighbour ? distance : factor * distance), x = _a.x, y = _a.y;
            sum.x += x;
            sum.y += y;
        }
        return sum;
    }
    // step
    return function () {
        var sum = 1;
        for (var _i = 0, nodes_2 = nodes; _i < nodes_2.length; _i++) {
            var node = nodes_2[_i];
            var _a = grad(node), x = _a.x, y = _a.y;
            node.x += alpha * x;
            node.y += alpha * y;
            sum += Math.abs(x) + Math.abs(y);
        }
        return sum;
    };
}
// logic
function $logic(network) {
    $reset();
    $drawEdges(network);
    if (Math.random() < impulse) {
        $activate(network.nodes[Math.floor(Math.random() * network.nodes.length)]);
    }
    network.nodes.forEach(function (node) {
        if (active(node)) {
            neighbours(network, node).forEach($activate);
        }
        $update(node);
        $draw(node);
    });
    if (!pauseStep) {
        var sum = $step();
        if (sum < .01) {
            pauseStep = true;
            console.log("step paused");
        }
    }
}
// setup
var n = createNetwork(nodeCount, edgeCount);
var $step = gradientDesecent(n, distance, alpha);
function $animation() {
    var start = new Date().getTime();
    if (!pause) {
        $logic(n);
    }
    speed += (new Date().getTime() - start) / 60;
    var now = new Date().getTime();
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
//# sourceMappingURL=bundle.js.map