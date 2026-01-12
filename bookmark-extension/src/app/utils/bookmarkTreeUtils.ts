export const separateFolderAndBookmarks = (arr: BookmarkTreeType[]) => {
  const folders: BookmarkTreeType[] = [];
  const bookmarks: BookmarkTreeType[] = [];
  arr.forEach((node) => {
    if (node.children && !node.url) {
      folders.push(node);
    } else {
      bookmarks.push(node);
    }
  });
  return { folders, bookmarks };
};

export const findNodeById = (
  nodes: BookmarkTreeType[],
  id: string,
): BookmarkTreeType | undefined => {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }

    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }

  return undefined;
};

export const findPathToNode = (
  nodes: BookmarkTreeType[],
  targetId: string,
  path: BookmarkTreeType[] = [],
): BookmarkTreeType[] | undefined => {
  for (const node of nodes) {
    const currentPath = [...path, node];

    if (node.id === targetId) {
      return currentPath;
    }

    if (node.children && node.children.length > 0) {
      const foundPath = findPathToNode(node.children, targetId, currentPath);
      if (foundPath) return foundPath;
    }
  }

  return undefined;
};

export function collectAllBookmarks(
  nodes?: BookmarkTreeType[],
): BookmarkTreeType[] {
  const result: BookmarkTreeType[] = [];

  if (!nodes || nodes.length === 0) return result;

  const traverse = (list: BookmarkTreeType[]) => {
    list.forEach((node) => {
      if (node.children && !node.url) {
        traverse(node.children);
      } else {
        result.push(node);
      }
    });
  };

  traverse(nodes);

  return result;
}
