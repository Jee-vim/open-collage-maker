// Grid geometry helpers.

// Compute balanced rows x cols from image count.
// Mapping matches SPEC: 2->1x2, 3->2x2, 4->2x2, 5->2x3, 6->2x3, 7->3x3, 8->3x3, 9->3x3, 10->3x4
export function balancedGrid(count) {
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  return { rows, cols };
}

// Split image index list into contiguous rows. The last row may be shorter.
export function chunkRows(indices, cols) {
  const rows = [];
  for (let i = 0; i < indices.length; i += cols) {
    rows.push(indices.slice(i, i + cols));
  }
  return rows;
}

// Distribute indices into N columns for masonry (round-robin by shortest column).
export function masonryColumns(indices, cols) {
  const columns = Array.from({ length: cols }, () => []);
  indices.forEach((idx, i) => {
    columns[i % cols].push(idx);
  });
  return columns;
}
