import { useCallback, useEffect, useRef } from 'react';
import {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from '@xyflow/react';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  SimulationNodeDatum,
  SimulationLinkDatum,
  Simulation,
} from 'd3-force';

interface UseForceLayoutOptions {
  strength?: number;
  distance?: number;
  chargeStrength?: number;
  collideRadius?: number;
  tickThrottle?: number;
}

interface D3Node extends SimulationNodeDatum {
  id: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  isPinned?: boolean;
}

interface D3Link extends SimulationLinkDatum<D3Node> {
  source: D3Node | string;
  target: D3Node | string;
}

export function useForceLayout(
  initialNodes: Node[],
  initialEdges: Edge[],
  options: UseForceLayoutOptions = {}
) {
  const {
    strength = 0.15,
    distance = 150,
    chargeStrength = -400,
    collideRadius = 80,
    tickThrottle = 16,
  } = options;

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const simulationRef = useRef<Simulation<D3Node, D3Link> | null>(null);
  const { fitView } = useReactFlow();
  const pinnedNodesRef = useRef<Set<string>>(new Set());
  const lastTickRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const initializedRef = useRef(false);
  const d3NodesRef = useRef<D3Node[]>([]);
  const d3LinksRef = useRef<D3Link[]>([]);

  const syncNodesToReactFlow = useCallback(() => {
    const nodeMap = new Map(d3NodesRef.current.map((n) => [n.id, n]));
    setNodes((nds) =>
      nds.map((n) => {
        const d3Node = nodeMap.get(n.id);
        if (d3Node && d3Node.x !== undefined && d3Node.y !== undefined) {
          return {
            ...n,
            position: { x: d3Node.x, y: d3Node.y },
            data: {
              ...n.data,
              isPinned: d3Node.isPinned || false,
            },
          };
        }
        return n;
      })
    );
  }, [setNodes]);

  const initSimulation = useCallback(
    (nodesData: Node[], edgesData: Edge[], shouldFitView = true) => {
      if (simulationRef.current) {
        simulationRef.current.stop();
        cancelAnimationFrame(rafRef.current);
      }

      const d3Nodes: D3Node[] = nodesData.map((n) => ({
        id: n.id,
        x: n.position.x || Math.random() * 600,
        y: n.position.y || Math.random() * 400,
        fx: null,
        fy: null,
        isPinned: false,
      }));

      const nodeIds = new Set(d3Nodes.map((n) => n.id));
      const d3Links: D3Link[] = edgesData
        .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
        .map((e) => ({
          source: e.source,
          target: e.target,
        }));

      d3NodesRef.current = d3Nodes;
      d3LinksRef.current = d3Links;

      const simulation = forceSimulation<D3Node>(d3Nodes)
        .force(
          'link',
          forceLink<D3Node, D3Link>(d3Links)
            .id((d) => d.id)
            .distance(() => distance)
            .strength(strength)
        )
        .force('charge', forceManyBody().strength(chargeStrength))
        .force('center', forceCenter(0, 0))
        .force('collide', forceCollide<D3Node>(collideRadius))
        .alphaDecay(0.03)
        .velocityDecay(0.4);

      simulation.on('tick', () => {
        const now = performance.now();
        if (now - lastTickRef.current < tickThrottle) return;
        lastTickRef.current = now;

        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          syncNodesToReactFlow();
        });
      });

      simulation.on('end', () => {
        if (shouldFitView) {
          fitView({ padding: 0.15, duration: 600 });
        }
      });

      simulationRef.current = simulation;

      if (shouldFitView) {
        setTimeout(() => {
          fitView({ padding: 0.15, duration: 800 });
        }, 1800);
      }
    },
    [strength, distance, chargeStrength, collideRadius, tickThrottle, syncNodesToReactFlow, fitView]
  );

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      initSimulation(nodes, edges);
    }
    return () => {
      simulationRef.current?.stop();
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onNodeDragStart = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const simNode = d3NodesRef.current.find((n) => n.id === node.id);
      if (simNode) {
        simNode.fx = node.position.x;
        simNode.fy = node.position.y;
      }
    },
    []
  );

  const onNodeDrag = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const simNode = d3NodesRef.current.find((n) => n.id === node.id);
      if (simNode) {
        simNode.fx = node.position.x;
        simNode.fy = node.position.y;
      }
    },
    []
  );

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const simNode = d3NodesRef.current.find((n) => n.id === node.id);
      if (simNode) {
        simNode.fx = node.position.x;
        simNode.fy = node.position.y;
        simNode.isPinned = true;
        pinnedNodesRef.current.add(node.id);
      }
      simulationRef.current?.alpha(0.3).restart();
    },
    []
  );

  const resetLayout = useCallback(() => {
    pinnedNodesRef.current.clear();
    d3NodesRef.current.forEach((n) => {
      n.fx = null;
      n.fy = null;
      n.isPinned = false;
    });
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, isPinned: false },
      }))
    );
    simulationRef.current?.alpha(1).restart();
    setTimeout(() => {
      fitView({ padding: 0.15, duration: 800 });
    }, 1500);
  }, [setNodes, fitView]);

  const reheat = useCallback(() => {
    simulationRef.current?.alpha(0.5).restart();
  }, []);

  const addNodeToSim = useCallback(
    (node: Node) => {
      const sim = simulationRef.current;
      if (!sim) return;

      const existing = d3NodesRef.current.find((n) => n.id === node.id);
      if (existing) return;

      const d3Node: D3Node = {
        id: node.id,
        x: node.position.x,
        y: node.position.y,
        fx: null,
        fy: null,
        isPinned: false,
      };
      d3NodesRef.current.push(d3Node);
      sim.nodes(d3NodesRef.current);
      sim.force('collide', forceCollide<D3Node>(collideRadius));
      sim.alpha(0.5).restart();
    },
    [collideRadius]
  );

  const addEdgeToSim = useCallback(
    (edge: Edge) => {
      const sim = simulationRef.current;
      if (!sim) return;

      const existing = d3LinksRef.current.find(
        (l) => {
          const sId = typeof l.source === 'string' ? l.source : l.source.id;
          const tId = typeof l.target === 'string' ? l.target : l.target.id;
          return sId === edge.source && tId === edge.target;
        }
      );
      if (existing) return;

      const d3Link: D3Link = {
        source: edge.source,
        target: edge.target,
      };
      d3LinksRef.current.push(d3Link);

      const linkForce = sim.force('link') as ReturnType<typeof forceLink<D3Node, D3Link>>;
      if (linkForce) {
        linkForce.links(d3LinksRef.current);
      }
      sim.alpha(0.5).restart();
    },
    []
  );

  const removeNodeFromSim = useCallback(
    (nodeId: string) => {
      const sim = simulationRef.current;
      if (!sim) return;

      d3NodesRef.current = d3NodesRef.current.filter((n) => n.id !== nodeId);
      d3LinksRef.current = d3LinksRef.current.filter((l) => {
        const sId = typeof l.source === 'string' ? l.source : l.source.id;
        const tId = typeof l.target === 'string' ? l.target : l.target.id;
        return sId !== nodeId && tId !== nodeId;
      });

      sim.nodes(d3NodesRef.current);
      const linkForce = sim.force('link') as ReturnType<typeof forceLink<D3Node, D3Link>>;
      if (linkForce) {
        linkForce.links(d3LinksRef.current);
      }
      sim.force('collide', forceCollide<D3Node>(collideRadius));
      sim.alpha(0.3).restart();
    },
    [collideRadius]
  );

  const removeEdgeFromSim = useCallback(
    (edgeId: string) => {
      const sim = simulationRef.current;
      if (!sim) return;

      const rfEdge = edges.find((e) => e.id === edgeId);
      if (!rfEdge) return;

      d3LinksRef.current = d3LinksRef.current.filter((l) => {
        const sId = typeof l.source === 'string' ? l.source : l.source.id;
        const tId = typeof l.target === 'string' ? l.target : l.target.id;
        return !(sId === rfEdge.source && tId === rfEdge.target);
      });

      const linkForce = sim.force('link') as ReturnType<typeof forceLink<D3Node, D3Link>>;
      if (linkForce) {
        linkForce.links(d3LinksRef.current);
      }
      sim.alpha(0.3).restart();
    },
    [edges]
  );

  const reinitialize = useCallback(
    (newNodes: Node[], newEdges: Edge[]) => {
      pinnedNodesRef.current.clear();
      setNodes(newNodes);
      setEdges(newEdges);
      initSimulation(newNodes, newEdges, true);
    },
    [setNodes, setEdges, initSimulation]
  );

  return {
    nodes,
    setNodes,
    edges,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
    reheat,
    resetLayout,
    reinitialize,
    addNodeToSim,
    addEdgeToSim,
    removeNodeFromSim,
    removeEdgeFromSim,
  };
}
