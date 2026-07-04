package com.matgourmand.reservation.dto;

import com.matgourmand.reservation.domain.Reservation;
import com.matgourmand.reservation.domain.ReservationStatus;
import java.time.LocalDateTime;

public record ReservationResponse(
        Long id,
        Long storeId,
        String storeName,
        Long customerId,
        String customerName,
        LocalDateTime reservationTime,
        int partySize,
        ReservationStatus status,
        String requestNote,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static ReservationResponse from(Reservation reservation) {
        return new ReservationResponse(
                reservation.getId(),
                reservation.getStore().getId(),
                reservation.getStore().getName(),
                reservation.getCustomer().getId(),
                reservation.getCustomer().getName(),
                reservation.getReservationTime(),
                reservation.getPartySize(),
                reservation.getStatus(),
                reservation.getRequestNote(),
                reservation.getCreatedAt(),
                reservation.getUpdatedAt()
        );
    }
}
