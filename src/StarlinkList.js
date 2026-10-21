import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const satIcon = L.divIcon({
      html: '<div style="font-size:20px;filter:drop-shadow(0 0 6px #60a5fa);">🛰️</div>',
      className: '',
      iconSize: [24,24],
      iconAnchor: [12,12]
  });

function StartlinkList() {
    const [starlinks, setStarlinks] = useState([]);
    const [page,setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [total, setTotal] = useState(0);
    const inicializacao = useRef(true);

    useEffect(() => {
        if (inicializacao.current) {
            fetchStarlinks(1);
            inicializacao.current = false;
        }
    },[]);

    const fetchStarlinks = async (page) => {
        try {
            const response = await axios.post('https://api.spacexdata.com/v4/starlink/query', {
                "query": {},
                "options": { page: page, limit: 100 }
            });
            setStarlinks((docsAtuais) => [...docsAtuais, ...response.data.docs]);
            setHasNextPage(response.data.hasNextPage);
            setTotal(response.data.totalDocs);
        } catch (error) {
            console.error('Erro ao obter dados da api da starlink:', error);
        }
    }

    const loadMore = () => {
        if (hasNextPage) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchStarlinks(nextPage);
        }
    };

    const satelitesComPosicao = starlinks.filter(
        (sat) => sat.latitude !== null && sat.longitude !== null
    );

    return (
        <div className="starlink-app">
            <div className="starlink-header">
                <h1>
                    <span className="icon">🛰️</span>
                    <span className="gradient-text">Satélites da Starlink</span>
                </h1>
                <div className="stats">
                    <div className="stat">
                        <span className="stat-label">Carregados</span>
                        <span className="stat-value highlight">{starlinks.length}</span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Total</span>
                        <span className="stat-value">{total}</span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Com posição</span>
                        <span className="stat-value">{satelitesComPosicao.length}</span>
                    </div>
                </div>
            </div>
            <div className="map-wrapper">
                <MapContainer center={[20, 0]} zoom={2} minZoom={2}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    {satelitesComPosicao.map((sat) => (
                        <Marker key={sat.id} position={[sat.latitude, sat.longitude]} icon={satIcon}>
                            <Popup>
                                <div>
                                    <h1>{sat.spaceTrack.OBJECT_NAME}</h1>
                                    <p><strong>Latitude:</strong> {sat.latitude.toFixed(3)}</p>
                                    <p><strong>Longitude:</strong> {sat.longitude.toFixed(3)}</p>
                                    <p><strong>Velocidade:</strong> {sat.velocity_kms?.toFixed(2)} km/s</p>
                                    <p><strong>Altura:</strong> {sat.height_km?.toFixed(1)} km</p>
                                    <p><strong>Lançamento:</strong> {sat.spaceTrack.LAUNCH_DATE}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
            <div className="footer">
                {hasNextPage && (
                    <button className="load-more-btn" onClick={loadMore}>
                        ⬇ Carregar mais
                    </button>
                )}
                <p className="counter">
                    <strong>{starlinks.length}</strong> satélites carregados de um total de <strong>{total}</strong>
                </p>
            </div>
        </div>
    );
}

export default StartlinkList;
