package com.tourmatch.backend.services;

import com.tourmatch.backend.models.Reserva;
import com.tourmatch.backend.dtos.ReservaDTO;
import com.tourmatch.backend.models.Usuario;
import com.tourmatch.backend.models.Waypoint;
import com.tourmatch.backend.repositories.ReservaRepository;
import com.tourmatch.backend.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ReservaService {

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Transactional
    public Reserva crearReservaConUsuario(Reserva reserva, String emailTurista) {
        Usuario turista = usuarioRepository.findByEmail(emailTurista)
                .orElseThrow(() -> new RuntimeException("Turista no encontrado"));
        reserva.setTurista(turista);

        if (reserva.getWaypoints() != null && !reserva.getWaypoints().isEmpty()) {
            for (Waypoint wp : reserva.getWaypoints()) {
                wp.setReserva(reserva);
            }
        } else {
            throw new RuntimeException("Una ruta personalizada requiere mínimo un origen y un destino.");
        }

        reserva.setEstado(Reserva.EstadoReserva.PENDIENTE);
        return reservaRepository.save(reserva);
    }

    public List<Reserva> obtenerReservasPorUsuario(String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return reservaRepository.findAll().stream()
                .filter(r -> r.getTurista() != null && r.getTurista().getId().equals(usuario.getId()))
                .toList();
    }

    /**
     * 🌟 SOLUCIÓN ANTIBLOQUEO: Cambiamos el Stream por un bucle tradicional "for" con un Try-Catch interno.
     * Si un solo campo falla o viene corrupto, se salta, pero JAMÁS romperá la lista completa de viajes.
     */
    public List<ReservaDTO> obtenerViajesDisponibles(int capacidadConductor) {
        List<ReservaDTO> listaMapeada = new ArrayList<>();
        List<Reserva> todasLasReservas = reservaRepository.findAll();

        for (Reserva r : todasLasReservas) {
            try {
                // 1. Solo procesamos los que están PENDIENTES (Como tus registros 3 y 4)
                if (r.getEstado() != Reserva.EstadoReserva.PENDIENTE) {
                    continue; 
                }

                // 2. Extraer el nombre del turista de forma segura
                String nombrePasajero = "Pasajero";
                if (r.getTurista() != null) {
                    nombrePasajero = r.getTurista().getNombre();
                }

                // 3. Extraer los waypoints de forma ultra segura
                List<ReservaDTO.WaypointDTO> waypointDtos = new ArrayList<>();
                if (r.getWaypoints() != null) {
                    for (Waypoint wp : r.getWaypoints()) {
                        waypointDtos.add(new ReservaDTO.WaypointDTO(
                            wp.getId(),
                            wp.getDireccion(),
                            wp.getOrden()
                        ));
                    }
                }

                // 4. Formatear las variables asegurando coincidencia exacta con Lombok
                String fechaStr = (r.getFechaViaje() != null) ? r.getFechaViaje().toString() : "";
                Double precio = (r.getPrecioTotal() != null) ? r.getPrecioTotal() : 0.0;
                Integer pasajeros = (r.getCantidadPasajeros() != null) ? r.getCantidadPasajeros() : 1;
                String estadoStr = (r.getEstado() != null) ? r.getEstado().name() : "PENDIENTE";

                // 5. Construimos el DTO plano libre de bucles
                ReservaDTO dto = new ReservaDTO(
                    r.getId(),
                    fechaStr,
                    precio,
                    pasajeros,
                    estadoStr,
                    nombrePasajero,
                    waypointDtos
                );

                listaMapeada.add(dto);

            } catch (Exception e) {
                // Si ocurre un descalce de nombres en una fila, este catch evita que se caiga la API completa
                System.err.println("Error procesando reserva ID: " + r.getId() + " -> " + e.getMessage());
            }
        }

        return listaMapeada;
    }

    @Transactional
    public Reserva aceptarReserva(Long reservaId, String emailConductor) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        if (reserva.getEstado() != Reserva.EstadoReserva.PENDIENTE) {
            throw new RuntimeException("Este viaje ya fue procesado o cancelado.");
        }

        Usuario conductor = usuarioRepository.findByEmail(emailConductor)
                .orElseThrow(() -> new RuntimeException("Conductor no encontrado"));

        reserva.setConductor(conductor);
        reserva.setEstado(Reserva.EstadoReserva.ACEPTADA);

        return reservaRepository.save(reserva);
    }
}