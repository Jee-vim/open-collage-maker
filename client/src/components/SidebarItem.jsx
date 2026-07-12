import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function SidebarItem({ item, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="!px-4 list-item group" {...attributes}>
      <span className="text-fg-dim cursor-grab select-none" {...listeners}>⠿</span>
      <div className="thumb-wrap">
        <img src={item.preview} alt={item.name} className="thumb" draggable="false" />
        <button onPointerDown={(e) => e.stopPropagation()} onClick={() => onRemove(item.id)} className="thumb-remove" title="Remove" type="button">✕</button>
      </div>
    </div>
  );
}
