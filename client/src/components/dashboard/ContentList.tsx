
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";

interface Content {
  id: number;
  title: string;
  pageType: string;
  content: string;
  order: number;
  active: boolean;
}

interface ContentListProps {
  contents?: Content[];
  isLoading?: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const getPageTypeName = (pageType: string) => {
  const types = {
    agriculture: 'Agricultura',
    fishing: 'Pesca',
    paa: 'PAA'
  };
  return types[pageType as keyof typeof types] || pageType;
};

const ContentList = ({ contents, isLoading, onEdit, onDelete }: ContentListProps) => {
  return (
    <Card>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !contents || contents.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-neutral-dark mb-4">Nenhum conteúdo cadastrado.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Página</TableHead>
                <TableHead>Ordem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contents.map((content) => (
                <TableRow key={content.id}>
                  <TableCell className="font-medium">{content.title}</TableCell>
                  <TableCell>{getPageTypeName(content.pageType)}</TableCell>
                  <TableCell>{content.order}</TableCell>
                  <TableCell>
                    <Badge variant={content.active ? "default" : "outline"}>
                      {content.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(content.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(content.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentList;
