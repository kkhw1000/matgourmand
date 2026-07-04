package com.matgourmand.reservation.domain;

import com.matgourmand.common.entity.BaseTimeEntity;
import com.matgourmand.common.exception.BadRequestException;
import com.matgourmand.common.exception.ErrorCode;
import com.matgourmand.store.domain.Store;
import com.matgourmand.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "reservations")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Reservation extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @Column(nullable = false)
    private LocalDateTime reservationTime;

    @Column(nullable = false)
    private int partySize;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status;

    @Column(length = 500)
    private String requestNote;

    private Reservation(
            Store store,
            User customer,
            LocalDateTime reservationTime,
            int partySize,
            ReservationStatus status,
            String requestNote
    ) {
        this.store = store;
        this.customer = customer;
        this.reservationTime = reservationTime;
        this.partySize = partySize;
        this.status = status;
        this.requestNote = requestNote;
    }

    public static Reservation create(
            Store store,
            User customer,
            LocalDateTime reservationTime,
            int partySize,
            String requestNote
    ) {
        validatePartySize(partySize);
        return new Reservation(store, customer, reservationTime, partySize, ReservationStatus.PENDING, requestNote);
    }

    public void cancel() {
        if (status == ReservationStatus.CANCELED) {
            throw new BadRequestException(ErrorCode.RESERVATION_ALREADY_CANCELED);
        }
        this.status = ReservationStatus.CANCELED;
    }

    private static void validatePartySize(int partySize) {
        if (partySize < 1) {
            throw new BadRequestException(ErrorCode.RESERVATION_PARTY_SIZE_INVALID);
        }
    }
}
