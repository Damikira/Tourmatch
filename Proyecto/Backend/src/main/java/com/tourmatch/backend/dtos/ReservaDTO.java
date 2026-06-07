package com.tourmatch.backend.dtos;

import java.util.List;

public record ReservaDTO(
    Long id,
    String fechaViaje,
    Double precioTotal,
    Integer cantidadPasajeros,
    String estado,
    String nombreTurista, // ◄-- Sincronizado con viaje.nombreTurista de React
    List<WaypointDTO> waypoints // ◄-- Sincronizado con viaje.waypoints de React
) {
    public record WaypointDTO(
        Long id,
        String direccion, // ◄-- Sincronizado con wp.direccion
        Integer orden     // ◄-- Sincronizado con wp.orden
    ) {}
}