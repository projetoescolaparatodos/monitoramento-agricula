import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
  Badge,
  Button,
} from "@nextui-org/react";
import { MapPin } from "react-feather";

// Placeholder function for opening in maps
const abrirNoMaps = (latitude, longitude) => {
  window.open(`https://www.google.com/maps?q=${latitude},${longitude}`);
};

// Placeholder function for determining status color
const getStatusColor = (status) => {
  switch (status) {
    case 'Ativo':
      return 'success';
    case 'Em Construção':
      return 'warning';
    case 'Desativado':
      return 'danger';
    default:
      return 'default';
  }
};

const MetadadosViveiros = () => {
  const [viveiroSelecionado, setViveiroSelecionado] = useState(null);

  // Placeholder data for viveiros
  const viveiros = [
    {
      id: '1',
      nomeProprietario: 'João Silva',
      localidade: 'Rio de Janeiro',
      statusObra: 'Ativo',
      tipoViveiro: 'Escavado',
      tamanho: 100,
      tecnicoResponsavel: 'Maria Souza',
      dataCadastro: new Date(),
      latitude: -22.9068,
      longitude: -43.1729,
    },
    {
      id: '2',
      proprietario: 'Carlos Pereira',
      localidade: 'São Paulo',
      status: 'Em Construção',
      tipo: 'Tanque Rede',
      tamanho: 50,
      tecnico: 'Ana Oliveira',
      data: new Date(),
      latitude: -23.5505,
      longitude: -46.6333,
    },
  ];

  return (
    <Table aria-label="Lista de Viveiros">
      <TableHeader>
        <TableCell>Proprietário</TableCell>
        <TableCell>Localidade</TableCell>
        <TableCell>Status</TableCell>
        <TableCell>Tipo</TableCell>
        <TableCell>Tamanho</TableCell>
        <TableCell>Técnico Responsável</TableCell>
        <TableCell>Data de Cadastro</TableCell>
        <TableCell>Ações</TableCell>
      </TableHeader>
      <TableBody>
        {viveiros.map((viveiro) => (
          <TableRow 
                          key={viveiro.id}
                          className={`cursor-pointer hover:bg-gray-50 ${viveiroSelecionado?.id === viveiro.id ? 'bg-blue-50' : ''}`}
                          onClick={() => setViveiroSelecionado(viveiro)}
                        >
                          <TableCell className="font-medium">{viveiro.nomeProprietario || viveiro.proprietario || 'Não informado'}</TableCell>
                          <TableCell>{viveiro.localidade || 'Não informado'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(viveiro.statusObra || viveiro.status || 'Não informado')}>
                              {viveiro.statusObra || viveiro.status || 'Não informado'}
                            </Badge>
                          </TableCell>
                          <TableCell>{viveiro.tipoViveiro || viveiro.tipo || 'Não informado'}</TableCell>
                          <TableCell>{viveiro.tamanho ? `${viveiro.tamanho}m²` : 'Não informado'}</TableCell>
                          <TableCell>{viveiro.tecnicoResponsavel || viveiro.tecnico || 'Não informado'}</TableCell>
                          <TableCell>
                            {viveiro.dataCadastro || viveiro.data ? 
                              format(new Date(viveiro.dataCadastro || viveiro.data), 'dd/MM/yyyy', { locale: ptBR }) 
                              : 'Não informado'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {viveiro.latitude && viveiro.longitude && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    abrirNoMaps(viveiro.latitude!, viveiro.longitude!);
                                  }}
                                >
                                  <MapPin className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default MetadadosViveiros;