interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
}

// 북마크(링크)
interface BookmarkItemType {
  id: string;
  title: string;
  url?: string; // URL이 있으면 북마크 확정
  children?: never; // 북마크는 children 없음
}

// 폴더
interface FolderNodeType {
  id: string;
  title: string;
  children: BookmarkTree[]; // children은 트리 배열
  url?: never; // 폴더는 url 없음
}

// 폴더 또는 북마크가 될 수 있는 전체 타입
type BookmarkTreeType = FolderNode | BookmarkItem;
