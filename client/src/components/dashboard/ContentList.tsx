
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { ContentItem } from '@/types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/utils/firebase';

interface ContentListProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ContentList = ({ onEdit, onDelete }: ContentListProps) => {
  const { data: contents, isLoading } = useQuery<ContentItem[]>({
    queryKey: ['contents'],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, 'contents'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ContentItem));
    }
  });

  const getPageTypeName = (pageType: string) => {
    const types = {
      home: 'Página Inicial',
      agriculture: 'Agricultura',
      fishing: 'Pesca',
      paa: 'PAA'
    };
    return types[pageType as keyof typeof types] || pageType;
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Página</TableHead>
            <TableHead>Data de Criação</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contents && contents.map((content) => (
            <TableRow key={content.id}>
              <TableCell>{content.title}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {getPageTypeName(content.pageType)}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(content.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(content.id)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(content.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default ContentList;
