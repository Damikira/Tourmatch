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

import java.time.LocalDateTime;
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
     * 🌟 CORREGIDO: Filtrado inteligente adaptado al modelo de negocio de TourMatch.
     * Si la capacidad informada por el conductor es <= 4, se asume categoría BASICO (viajes de 1 a 4 personas).
     * Si la capacidad es >= 5, se activa la categoría XL (viajes desde 5 hasta 12 personas).
     */
    public List<ReservaDTO> obtenerViajesDisponibles(int capacity) {
        List<ReservaDTO> listaMapeada = new ArrayList<>();
        List<Reserva> todasLasReservas = reservaRepository.findAll();

        for (Reserva r : todasLasReservas) {
            try {
                if (r.getEstado() != Reserva.EstadoReserva.PENDIENTE) {
                    continue; 
                }

                int pasajerosViaje = (r.getCantidadPasajeros() != null) ? r.getCantidadPasajeros() : 1;

                // Evaluación estricta por rangos para evitar problemas de sincronización
                if (capacity <= 4) {
                    // Vehículo Básico: viajes de 4 personas o menos (¡incluye perfectamente viajes de 1 pasajero!)
                    if (pasajerosViaje > 4 || pasajerosViaje < 1) {
                        continue;
                    }
                } else {
                    // Vehículo XL: viajes desde 5 hasta 12 pasajeros
                    if (pasajerosViaje < 5 || pasajerosViaje > 12) {
                        continue;
                    }
                }

                String nombrePasajero = (r.getTurista() != null) ? r.getTurista().getNombre() : "Pasajero";

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

                String fechaStr = (r.getFechaViaje() != null) ? r.getFechaViaje().toString() : "";
                Double precio = (r.getPrecioTotal() != null) ? r.getPrecioTotal() : 0.0;
                String estadoStr = r.getEstado().name();

                listaMapeada.add(new ReservaDTO(
                    r.getId(),
                    fechaStr,
                    precio,
                    pasajerosViaje,
                    estadoStr,
                    nombrePasajero,
                    waypointDtos
                ));

            } catch (Exception e) {
                System.err.println("Error procesando filtros de reserva ID: " + r.getId() + " -> " + e.getMessage());
            }
        }
        return listaMapeada;
    }

    @Transactional
    public Reserva aceptarReserva(Long reservaId, String emailConductor) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        if (reserva.getEstado() != Reserva.EstadoReserva.PENDIENTE) {
            throw new RuntimeException("Este viaje ya fue procesado o tomado por otro conductor.");
        }

        Usuario conductor = usuarioRepository.findByEmail(emailConductor)
                .orElseThrow(() -> new RuntimeException("Conductor no encontrado"));

        reserva.setConductor(conductor);
        reserva.setEstado(Reserva.EstadoReserva.ACEPTADA);

        // Forzamos la persistencia instantánea para que aparezca abajo de inmediato
        return reservaRepository.saveAndFlush(reserva);
    }

    public List<ReservaDTO> obtenerViajesAceptadosPorConductor(String emailConductor) {
        Usuario conductor = usuarioRepository.findByEmail(emailConductor)
                .orElseThrow(() -> new RuntimeException("Conductor no encontrado"));

        List<ReservaDTO> listaMapeada = new ArrayList<>();
        List<Reserva> todasLasReservas = reservaRepository.findAll();

        for (Reserva r : todasLasReservas) {
            if (r.getConductor() != null && 
                r.getConductor().getId().equals(conductor.getId()) && 
                r.getEstado() == Reserva.EstadoReserva.ACEPTADA) {
                
                try {
                    String nombrePasajero = (r.getTurista() != null) ? r.getTurista().getNombre() : "Pasajero";
                    
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

                    String fechaStr = (r.getFechaViaje() != null) ? r.getFechaViaje().toString() : "";
                    Double precio = (r.getPrecioTotal() != null) ? r.getPrecioTotal() : 0.0;
                    Integer pasajeros = (r.getCantidadPasajeros() != null) ? r.getCantidadPasajeros() : 1;

                    listaMapeada.add(new ReservaDTO(
                        r.getId(),
                        fechaStr,
                        precio,
                        pasajeros,
                        r.getEstado().name(),
                        nombrePasajero,
                        waypointDtos
                    ));
                } catch (Exception e) {
                    System.err.println("Error procesando viaje asignado ID: " + r.getId() + " -> " + e.getMessage());
                }
            }
        }
        return listaMapeada;
    }

    @Transactional
    public Reserva finalizarReserva(Long reservaId, String emailConductor) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        if (reserva.getConductor() == null || !reserva.getConductor().getEmail().equals(emailConductor)) {
            throw new RuntimeException("No estás autorizado para finalizar este viaje.");
        }
        
        if (reserva.getEstado() != Reserva.EstadoReserva.ACEPTADA) {
            throw new RuntimeException("Solo se pueden finalizar viajes que estén en estado ACEPTADA.");
        }

        reserva.setEstado(Reserva.EstadoReserva.COMPLETADA);
        return reservaRepository.saveAndFlush(reserva);
    }
}