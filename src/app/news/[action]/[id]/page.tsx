'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useNews } from '@/contexts/NewsContext';
import { NewsFormData } from '@/types/news';
import Header from '@/components/layout/Header';
import MDEditor from '@uiw/react-md-editor';
import IconRender from '@/components/common/IconRender';
import { formatDate } from '@/lib/utils';

export default function NewsEditorPage() {
  const router = useRouter();
  const params = useParams();
  const { createNews, updateNews, getNewsById } = useNews();
  const [initialData, setInitialData] = useState<Partial<NewsFormData> | undefined>();
  const isEditing = params.action === 'edit';
  const id = params.id as string;

  useEffect(() => {
    if (isEditing && id) {
      const newsData = getNewsById(id);
      if (newsData) {
        setInitialData(newsData);
      } else {
        router.push('/news');
      }
    }
  }, [isEditing, id]);

  // ... resto del código igual ...
} 