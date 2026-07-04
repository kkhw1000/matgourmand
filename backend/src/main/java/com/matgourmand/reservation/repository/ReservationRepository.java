package com.matgourmand.reservation.repository;

import com.matgourmand.reservation.domain.Reservation;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @EntityGraph(attributePaths = {"store", "customer"})
    Optional<Reservation> findById(Long id);

    @EntityGraph(attributePaths = {"store", "customer"})
    List<Reservation> findAllByStoreIdOrderByReservationTimeAsc(Long storeId);
}
