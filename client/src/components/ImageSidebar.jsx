import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import SidebarItem from './SidebarItem.jsx';

export default function ImageSidebar({ images, onRemove, onClear, onReorder }) {
  if (images.length === 0) return null;

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((i) => i.id === active.id);
      const newIndex = images.findIndex((i) => i.id === over.id);
      onReorder(arrayMove(images, oldIndex, newIndex));
    }
  };

  return (
    <div className="flex-1 min-h-0">
      <div className="section flex justify-between items-center">
        <span className="section-label"> Images ({images.length})</span>
        <button onClick={onClear} className="btn-ghost text-sm">Clear</button>
      </div>
      <div className="overflow-y-auto">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images.map((i) => i.id)} strategy={rectSortingStrategy}>
            <div className="divide-y divide-border">
              {images.map((it) => <SidebarItem key={it.id} item={it} onRemove={onRemove} />)}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
