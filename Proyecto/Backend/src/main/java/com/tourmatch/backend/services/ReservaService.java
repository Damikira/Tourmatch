package com.tourmatch.backend.services;

import com.tourmatch.backend.models.Reserva;
import com.tourmatch.backend.models.Usuario;
import com.tourmatch.backend.models.Waypoint;
import com.tourmatch.backend.repositories.ReservaRepository;
import com.tourmatch.backend.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReservaService {

    @Autowired
    private ReservaRepository reservaRepository;

    // NUEVO: Traemos el repositorio de usuarios para buscar al conductor
    @Autowired
    private UsuarioRepository usuarioRepository;

    public Reserva crearReserva(Reserva reserva) {
        if (reserva.getFechaViaje().isBefore(LocalDateTime.now().plusHours(10))) {
            throw new RuntimeException("Las reservas deben realizarse con al menos 10 horas de anticipación.");
        }

        if (reserva.getWaypoints() != null) {
            for (Waypoint wp : reserva.getWaypoints()) {
                wp.setReserva(reserva);
            }
        }

        reserva.setEstado(Reserva.EstadoReserva.PENDIENTE);
        return reservaRepository.save(reserva);
    }

    public List<Reserva> obtenerViajesDisponibles(int capacidadConductor) {
        return reservaRepository.findAll().stream()
                .filter(r -> r.getEstado() == Reserva.EstadoReserva.PENDIENTE)
                .filter(r -> r.getCantidadPasajeros() <= capacidadConductor)
                .toList();
    }

    // NUEVO: Método para aceptar la reserva
    public Reserva aceptarReserva(Long reservaId, String emailConductor) {
        // 1. Buscamos la reserva
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        // 2. Verificamos que siga pendiente
        if (reserva.getEstado() != Reserva.EstadoReserva.PENDIENTE) {
            throw new RuntimeException("Este viaje ya fue aceptado por otro conductor o fue cancelado.");
        }

        // 3. Buscamos al conductor por su email
        Usuario conductor = usuarioRepository.findByEmail(emailConductor)
                .orElseThrow(() -> new RuntimeException("Conductor no encontrado"));

        // 4. Asignamos el conductor y cambiamos el estado
        reserva.setConductor(conductor);
        reserva.setEstado(Reserva.EstadoReserva.ACEPTADA);

        return reservaRepository.save(reserva);
    }
}