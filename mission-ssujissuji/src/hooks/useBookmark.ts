import { useQuery } from '@tanstack/react-query';

export function useBookmarks() {
  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3001/api/bookmarks');
      if (!res.ok) throw new Error('북마크 불러오기 실패');
      return res.json();
    },
  });
}
