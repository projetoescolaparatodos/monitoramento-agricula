
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleMap, LoadScript, Polygon } from '@react-google-maps/api';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useKmlBoundary } from '../hooks/useKmlBoundary';
import styles from './AgriculturaMap.module.css';

const AgriculturaMap = () => {
  const [agriculturasAtividades, setAgriculturasAtividades] = useState<any[]>([]);
  const [selectedTrator, setSelectedTrator] = useState<any | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const { municipioBoundary, isLoading: boundaryLoading } = useKmlBoundary();

  useEffect(() => {
    const fetchTratores = async () => {
      try {
        const q = query(
          collection(db, "tratores"),
          where("concluido", "==", true)
        );
        const querySnapshot = await getDocs(q);
        const tratoresData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAgriculturasAtividades(tratoresData);
      } catch (error) {
        console.error("Erro ao buscar tratores:", error);
      }
    };

    fetchTratores();
  }, []);

  // Define os limites do mapa com base no polígono do município
  const bounds = useMemo(() => {
    if (!municipioBoundary || municipioBoundary.length === 0) return undefined;
    
    const bounds = new google.maps.LatLngBounds();
    municipioBoundary.forEach(point => {
      bounds.extend(point);
    });
    return bounds;
  }, [municipioBoundary]);

  // Polígono do "mundo todo" (usado para criar a máscara)
  const worldPolygon = useMemo(() => [
    { lat: -90, lng: -180 },
    { lat: -90, lng: 180 },
    { lat: 90, lng: 180 },
    { lat: 90, lng: -180 },
    { lat: -90, lng: -180 }, // Fechar o polígono
  ], []);

  // Estilo para a área externa - com filtro escuro e desfocado
  const maskStyle = useMemo(() => ({
    fillColor: '#000000',
    fillOpacity: 0.5,
    strokeWeight: 0,
    clickable: false
  }), []);

  // Estilo para o contorno do município
  const municipioStyle = useMemo(() => ({
    fillColor: 'transparent',
    fillOpacity: 0,
    strokeColor: '#FFFFFF',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    clickable: false
  }), []);

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
    if (bounds) {
      map.fitBounds(bounds);
    }
  }, [bounds]);

  return (
    <div className="w-full h-screen">
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ""}>
        <GoogleMap
          mapContainerClassName="w-full h-full"
          onLoad={handleMapLoad}
          options={{
            fullscreenControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            zoomControl: true,
            latLngBounds: bounds,
            strictBounds: true,
          },
          mapTypeId: google.maps.MapTypeId.SATELLITE,
          mapTypeControl: false,
          styles: [
            {
              featureType: "administrative",
              elementType: "geometry",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "administrative.country",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "administrative.province",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "administrative.locality",
              elementType: "labels",
              stylers: [{ color: "#f8f8f8" }],
            },
            {
              featureType: "road",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "road",
              elementType: "geometry",
              stylers: [{ color: "#ffffff", weight: 0.1 }],
            },
            {
              featureType: "transit",
              stylers: [{ visibility: "off" }],
            },
          ],
        }
        >
        {/* Máscara para escurecer o exterior do município */}
        <Polygon
          paths={[
            worldPolygon,  // Primeiro caminho: polígono do mundo
            [...municipioBoundary].reverse() // Segundo caminho: município em ordem inversa
          ]}
          options={maskStyle}
          className={styles["external-area"]}
        />
        
        {/* Contorno do município (opcional, controlado pelo filtro) */}
        <Polygon
          paths={municipioBoundary}
          options={municipioStyle}
        />
        
        {/* Aqui você pode adicionar seus marcadores para cada atividade agrícola */}
        {/* Exemplo: 
        {agriculturasAtividades.map(atividade => (
          atividade.latitude && atividade.longitude ? (
            <Marker 
              key={atividade.id}
              position={{ lat: atividade.latitude, lng: atividade.longitude }}
              onClick={() => setSelectedTrator(atividade)}
            />
          ) : null
        ))}
        */}
        
        {/* Se um trator for selecionado, exiba a InfoWindow */}
        {/* Exemplo:
        {selectedTrator && (
          <InfoWindow
            position={{ lat: selectedTrator.latitude, lng: selectedTrator.longitude }}
            onCloseClick={() => setSelectedTrator(null)}
          >
            <div>
              <h3>{selectedTrator.nome}</h3>
              <p>{selectedTrator.localidade || selectedTrator.fazenda}</p>
              <p>Operação: {selectedTrator.operacao}</p>
              <p>Técnico: {selectedTrator.tecnicoResponsavel}</p>
            </div>
          </InfoWindow>
        )}
        */}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default AgriculturaMap;
