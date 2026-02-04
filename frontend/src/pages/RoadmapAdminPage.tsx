import { useEffect, useMemo, useState } from "react";
import {
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    ChevronDown,
    ChevronRight,
    Edit2,
    GripVertical,
    Loader2,
    Plus,
    Save,
    Trash2,
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../contexts/AuthContext";
import { roadmapsAPI } from "../lib/api";

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

function SortableNodeItem({
    node,
    depth,
    hasChildren,
    isExpanded,
    onToggle,
    onEdit,
    onDelete,
    onAddChild,
}: any) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: node._id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        marginLeft: `${depth * 22}px`,
    };

    return (
        <div className="mb-2">
            <div
                ref={setNodeRef}
                style={style}
                className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                    node.status === "published"
                        ? "border-primary/20 bg-card"
                        : "border-orange-500/20 bg-card"
                }`}
            >
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab text-muted-foreground hover:text-primary"
                >
                    <GripVertical size={16} />
                </div>

                <button
                    onClick={() => onToggle(node._id)}
                    className="p-1 hover:bg-secondary rounded"
                >
                    {hasChildren ? (
                        isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                    ) : (
                        <span className="w-3.5 h-3.5 block" />
                    )}
                </button>

                <div className="flex-1">
                    <div className="font-medium text-sm flex items-center gap-2">
                        {node.title}
                        {node.status === "draft" && (
                            <span className="text-[10px] bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded uppercase tracking-wide">
                                Draft
                            </span>
                        )}
                    </div>
                    {node.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-md">
                            {node.description}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onAddChild(node._id)}
                    >
                        <Plus size={14} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(node)}
                    >
                        <Edit2 size={14} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => onDelete(node._id)}
                    >
                        <Trash2 size={14} />
                    </Button>
                </div>
            </div>
        </div>
    );
}

function PreviewNode({ node, depth = 0 }: any) {
    const [expanded, setExpanded] = useState(depth < 1);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="relative">
            <div className="flex items-start gap-2">
                {hasChildren ? (
                    <button
                        className="mt-1 p-1 hover:bg-secondary rounded"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                ) : (
                    <span className="w-6" />
                )}

                <div className="flex-1">
                    <div className="text-sm font-semibold text-foreground">{node.title}</div>
                    {node.description && (
                        <div className="text-xs text-muted-foreground">{node.description}</div>
                    )}
                </div>
            </div>

            {expanded && hasChildren && (
                <div className="ml-6 border-l border-border/60 pl-4 mt-2 space-y-2">
                    {node.children.map((child: any) => (
                        <PreviewNode key={child._id} node={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function RoadmapAdminPage() {
    const websiteName = import.meta.env.VITE_WEBSITE_NAME
    const { token, isAdmin } = useAuth();

    useEffect(() => {
        document.title = `Manage Roadmaps | ${websiteName}`
    }, [websiteName])

    const [roadmaps, setRoadmaps] = useState<any[]>([]);
    const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
    const [nodes, setNodes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isRoadmapSaving, setIsRoadmapSaving] = useState(false);
    const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
    const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const [roadmapTitle, setRoadmapTitle] = useState("");
    const [roadmapSlug, setRoadmapSlug] = useState("");
    const [roadmapDescription, setRoadmapDescription] = useState("");
    const [roadmapStatus, setRoadmapStatus] = useState("draft");

    const [newRoadmapTitle, setNewRoadmapTitle] = useState("");
    const [newRoadmapSlug, setNewRoadmapSlug] = useState("");
    const [newRoadmapDescription, setNewRoadmapDescription] = useState("");
    const [newRoadmapStatus, setNewRoadmapStatus] = useState("draft");

    const [editingNode, setEditingNode] = useState<any | null>(null);
    const [nodeTitle, setNodeTitle] = useState("");
    const [nodeDesc, setNodeDesc] = useState("");
    const [nodeParentId, setNodeParentId] = useState<string | null>(null);
    const [nodeStatus, setNodeStatus] = useState("draft");
    const [nodeResourceLink, setNodeResourceLink] = useState("");

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        fetchRoadmaps();
    }, []);

    useEffect(() => {
        if (selectedRoadmapId) {
            fetchNodes(selectedRoadmapId);
            const selected = roadmaps.find((r) => r._id === selectedRoadmapId);
            if (selected) {
                setRoadmapTitle(selected.title || "");
                setRoadmapSlug(selected.slug || "");
                setRoadmapDescription(selected.description || "");
                setRoadmapStatus(selected.status || "draft");
            }
        }
    }, [selectedRoadmapId, roadmaps]);

    const selectedRoadmap = useMemo(
        () => roadmaps.find((r) => r._id === selectedRoadmapId) || null,
        [roadmaps, selectedRoadmapId]
    );

    const nodesById = useMemo(() => new Map(nodes.map((n) => [n._id, n])), [nodes]);

    const buildTree = (flatNodes: any[]) => {
        const map = new Map();
        const roots: any[] = [];

        flatNodes.forEach((node) => {
            map.set(node._id, { ...node, children: [] });
        });

        flatNodes.forEach((node) => {
            const mappedNode = map.get(node._id);
            if (node.parentId && map.has(node.parentId)) {
                map.get(node.parentId).children.push(mappedNode);
            } else {
                roots.push(mappedNode);
            }
        });

        const sortNodes = (arr: any[]) => {
            arr.sort((a, b) => (a.order || 0) - (b.order || 0));
            arr.forEach((child) => sortNodes(child.children));
        };

        sortNodes(roots);
        return roots;
    };

    const tree = useMemo(() => buildTree(nodes), [nodes]);

    const getChildren = (parentId: string | null) =>
        nodes
            .filter((n) => (n.parentId || null) === parentId)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

    const fetchRoadmaps = async () => {
        setIsLoading(true);
        try {
            const data = await roadmapsAPI.getAll("all");
            setRoadmaps(data || []);
            if (data.length > 0 && !selectedRoadmapId) {
                setSelectedRoadmapId(data[0]._id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchNodes = async (roadmapId: string) => {
        setIsLoading(true);
        try {
            const data = await roadmapsAPI.getNodes(roadmapId);
            setNodes(data || []);
            setExpandedIds(new Set((data || []).map((n: any) => n._id)));
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const activeNode = nodesById.get(active.id as string);
        const overNode = nodesById.get(over.id as string);
        if (!activeNode || !overNode) return;

        const activeParentId = activeNode.parentId || null;
        const overParentId = overNode.parentId || null;
        if (activeParentId !== overParentId) return;

        const siblings = getChildren(activeParentId);
        const oldIndex = siblings.findIndex((n) => n._id === activeNode._id);
        const newIndex = siblings.findIndex((n) => n._id === overNode._id);
        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = arrayMove(siblings, oldIndex, newIndex);
        const updates = reordered.map((n, index) => ({
            id: n._id,
            parentId: activeParentId,
            order: index,
        }));

        setNodes((prev) =>
            prev.map((n) => {
                const update = updates.find((u) => u.id === n._id);
                return update ? { ...n, order: update.order, parentId: update.parentId } : n;
            })
        );

        if (token && selectedRoadmapId) {
            try {
                await roadmapsAPI.reorderNodes(token, selectedRoadmapId, updates);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleSaveRoadmap = async () => {
        if (!selectedRoadmapId || !token) return;
        setIsRoadmapSaving(true);
        try {
            await roadmapsAPI.update(token, selectedRoadmapId, {
                title: roadmapTitle,
                slug: roadmapSlug || slugify(roadmapTitle),
                description: roadmapDescription,
                status: roadmapStatus,
            });
            await fetchRoadmaps();
        } catch (error) {
            console.error(error);
            alert("Failed to update roadmap");
        } finally {
            setIsRoadmapSaving(false);
        }
    };

    const handleCreateRoadmap = async () => {
        if (!token) return;
        setIsRoadmapSaving(true);
        try {
            const created = await roadmapsAPI.create(token, {
                title: newRoadmapTitle,
                slug: newRoadmapSlug || slugify(newRoadmapTitle),
                description: newRoadmapDescription,
                status: newRoadmapStatus,
            });
            setIsRoadmapModalOpen(false);
            setNewRoadmapTitle("");
            setNewRoadmapSlug("");
            setNewRoadmapDescription("");
            setNewRoadmapStatus("draft");
            await fetchRoadmaps();
            setSelectedRoadmapId(created._id);
        } catch (error) {
            console.error(error);
            alert("Failed to create roadmap");
        } finally {
            setIsRoadmapSaving(false);
        }
    };

    const handlePublishDrafts = async () => {
        if (!token) return;
        if (!confirm("Publish all draft roadmaps now?")) return;
        setIsRoadmapSaving(true);
        try {
            await roadmapsAPI.publishDrafts(token);
            await fetchRoadmaps();
        } catch (error) {
            console.error(error);
            alert("Failed to publish drafts");
        } finally {
            setIsRoadmapSaving(false);
        }
    };

    const openCreateNode = (parentId: string | null = null) => {
        setEditingNode(null);
        setNodeTitle("");
        setNodeDesc("");
        setNodeParentId(parentId || "root");
        setNodeStatus("draft");
        setNodeResourceLink("");
        setIsSaving(false);
        setIsNodeModalOpen(true);
    };

    const openEditNode = (node: any) => {
        setEditingNode(node);
        setNodeTitle(node.title);
        setNodeDesc(node.description || "");
        setNodeParentId(node.parentId || "root");
        setNodeStatus(node.status || "draft");
        setNodeResourceLink(node.resourceLink || "");
        setIsNodeModalOpen(true);
    };

    const handleSaveNode = async () => {
        if (!selectedRoadmapId || !token) return;
        setIsSaving(true);
        try {
            const payload = {
                roadmapId: selectedRoadmapId,
                title: nodeTitle,
                description: nodeDesc,
                parentId: nodeParentId === "root" ? null : nodeParentId,
                status: nodeStatus,
                resourceLink: nodeResourceLink,
            };

            if (editingNode && editingNode._id) {
                await roadmapsAPI.updateNode(token, editingNode._id, payload);
            } else {
                await roadmapsAPI.createNode(token, payload);
            }

            await fetchNodes(selectedRoadmapId);
            setEditingNode(null);
            setNodeTitle("");
            setNodeDesc("");
            setNodeParentId("root");
            setNodeStatus("draft");
            setNodeResourceLink("");
            setIsNodeModalOpen(false);
        } catch (error) {
            console.error(error);
            alert("Failed to save node");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteNode = async (id: string) => {
        if (!confirm("Delete this node and all its children?")) return;
        if (!token || !selectedRoadmapId) return;
        try {
            await roadmapsAPI.deleteNode(token, id);
            await fetchNodes(selectedRoadmapId);
        } catch (error) {
            console.error(error);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const renderTree = (parentId: string | null, depth = 0) => {
        const children = getChildren(parentId);
        if (children.length === 0) return null;

        return (
            <SortableContext items={children.map((c) => c._id)} strategy={verticalListSortingStrategy}>
                {children.map((child) => {
                    const childHasChildren = getChildren(child._id).length > 0;
                    const isExpanded = expandedIds.has(child._id);
                    return (
                        <div key={child._id}>
                            <SortableNodeItem
                                node={child}
                                depth={depth}
                                hasChildren={childHasChildren}
                                isExpanded={isExpanded}
                                onToggle={toggleExpand}
                                onEdit={openEditNode}
                                onDelete={handleDeleteNode}
                                onAddChild={openCreateNode}
                            />
                            {childHasChildren && isExpanded && (
                                <div className="ml-2">{renderTree(child._id, depth + 1)}</div>
                            )}
                        </div>
                    );
                })}
            </SortableContext>
        );
    };

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Access Denied</p>
            </div>
        );
    }

    return (
        <AdminLayout>
            <div className="px-6 py-10 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Roadmap Manager</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage roadmaps, edit nodes, and preview the tree live.
                        </p>
                    </div>
                    <Button onClick={() => setIsRoadmapModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> New Roadmap
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-3 space-y-4">
                        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Roadmaps
                        </h2>
                        <div className="space-y-2">
                            {roadmaps.map((map) => (
                                <button
                                    key={map._id}
                                    onClick={() => setSelectedRoadmapId(map._id)}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        selectedRoadmapId === map._id
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-secondary"
                                    }`}
                                >
                                    {map.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-6 space-y-6">
                        <div className="bg-card border border-border rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Roadmap Details</h2>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={handlePublishDrafts}
                                        disabled={isRoadmapSaving}
                                        size="sm"
                                    >
                                        Publish PDF
                                    </Button>
                                    <Button
                                        onClick={handleSaveRoadmap}
                                        disabled={!selectedRoadmap || isRoadmapSaving || !roadmapTitle}
                                        size="sm"
                                    >
                                        {isRoadmapSaving ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" /> Save
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {selectedRoadmap ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground">Title</label>
                                        <Input
                                            value={roadmapTitle}
                                            onChange={(e) => setRoadmapTitle(e.target.value)}
                                            placeholder="Roadmap title"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground">Slug</label>
                                        <Input
                                            value={roadmapSlug}
                                            onChange={(e) => setRoadmapSlug(e.target.value)}
                                            placeholder="frontend-engineer"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground">Description</label>
                                        <textarea
                                            value={roadmapDescription}
                                            onChange={(e) => setRoadmapDescription(e.target.value)}
                                            placeholder="Short description"
                                            className="w-full min-h-[90px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground">Status</label>
                                        <select
                                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                            value={roadmapStatus}
                                            onChange={(e) => setRoadmapStatus(e.target.value)}
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                        </select>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    Select a roadmap to edit details.
                                </div>
                            )}
                        </div>

                        <div className="bg-card border border-border rounded-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-semibold">Roadmap Nodes</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Create nodes, add children, and reorder with drag and drop.
                                    </p>
                                </div>
                                <Button onClick={() => openCreateNode(null)} disabled={!selectedRoadmapId}>
                                    <Plus className="w-4 h-4 mr-2" /> Add Root Node
                                </Button>
                            </div>

                            {isLoading ? (
                                <div className="flex justify-center p-10">
                                    <Loader2 className="animate-spin" />
                                </div>
                            ) : selectedRoadmap ? (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    {tree.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-10">
                                            No nodes yet. Start creating!
                                        </p>
                                    ) : (
                                        <div className="space-y-2">{renderTree(null, 0)}</div>
                                    )}
                                </DndContext>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    Select a roadmap to manage nodes.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <div className="bg-card border border-border rounded-xl p-6 h-full">
                            <h2 className="text-lg font-semibold mb-4">Live Tree Preview</h2>
                            {tree.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No nodes to preview yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {tree.map((node) => (
                                        <PreviewNode key={node._id} node={node} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isNodeModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-background border border-border rounded-xl shadow-2xl max-w-lg w-full p-6">
                        <h3 className="text-lg font-bold mb-4">
                            {editingNode ? "Edit Node" : "Create Node"}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Title</label>
                                <Input
                                    value={nodeTitle}
                                    onChange={(e) => setNodeTitle(e.target.value)}
                                    placeholder="Node Title"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Description</label>
                                <Input
                                    value={nodeDesc}
                                    onChange={(e) => setNodeDesc(e.target.value)}
                                    placeholder="Short description"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Resource Link</label>
                                <Input
                                    value={nodeResourceLink}
                                    onChange={(e) => setNodeResourceLink(e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Parent</label>
                                    <select
                                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                        value={nodeParentId || "root"}
                                        onChange={(e) => setNodeParentId(e.target.value)}
                                    >
                                        <option value="root">Root (No Parent)</option>
                                        {nodes
                                            .filter((n) => n._id !== editingNode?._id)
                                            .map((n) => (
                                                <option key={n._id} value={n._id}>
                                                    {n.title}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                                    <select
                                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                        value={nodeStatus}
                                        onChange={(e) => setNodeStatus(e.target.value)}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setEditingNode(null);
                                    setNodeTitle("");
                                    setNodeDesc("");
                                    setNodeParentId("root");
                                    setNodeStatus("draft");
                                    setNodeResourceLink("");
                                    setIsNodeModalOpen(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleSaveNode} disabled={isSaving || !nodeTitle}>
                                {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : "Save Node"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {isRoadmapModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-background border border-border rounded-xl shadow-2xl max-w-lg w-full p-6">
                        <h3 className="text-lg font-bold mb-4">Create Roadmap</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Title</label>
                                <Input
                                    value={newRoadmapTitle}
                                    onChange={(e) => setNewRoadmapTitle(e.target.value)}
                                    placeholder="Roadmap title"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Slug</label>
                                <Input
                                    value={newRoadmapSlug}
                                    onChange={(e) => setNewRoadmapSlug(e.target.value)}
                                    placeholder="frontend-engineer"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Description</label>
                                <textarea
                                    value={newRoadmapDescription}
                                    onChange={(e) => setNewRoadmapDescription(e.target.value)}
                                    placeholder="Short description"
                                    className="w-full min-h-[90px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Status</label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                    value={newRoadmapStatus}
                                    onChange={(e) => setNewRoadmapStatus(e.target.value)}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="outline" onClick={() => setIsRoadmapModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateRoadmap} disabled={isRoadmapSaving || !newRoadmapTitle}>
                                {isRoadmapSaving ? <Loader2 className="animate-spin w-4 h-4" /> : "Create"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
