package com.matgourmand.reservation.service;

import com.matgourmand.auth.AuthenticatedUser;
import com.matgourmand.businesshour.domain.BusinessHour;
import com.matgourmand.businesshour.repository.BusinessHourRepository;
import com.matgourmand.common.exception.BadRequestException;
import com.matgourmand.common.exception.ErrorCode;
import com.matgourmand.common.exception.ForbiddenException;
import com.matgourmand.common.exception.ResourceNotFoundException;
import com.matgourmand.reservation.domain.Reservation;
import com.matgourmand.reservation.dto.ReservationCreateRequest;
import com.matgourmand.reservation.dto.ReservationResponse;
import com.matgourmand.reservation.repository.ReservationRepository;
import com.matgourmand.store.domain.Store;
import com.matgourmand.store.repository.StoreRepository;
import com.matgourmand.user.domain.User;
import com.matgourmand.user.domain.UserRole;
import com.matgourmand.user.repository.UserRepository;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final StoreRepository storeRepository;
    private final UserRepository userRepository;
    private final BusinessHourRepository businessHourRepository;

    @Transactional
    public ReservationResponse createReservation(AuthenticatedUser authenticatedUser, ReservationCreateRequest request) {
        validateCustomerRole(authenticatedUser);

        Store store = getStoreEntity(request.storeId());
        User customer = getCustomerEntity(authenticatedUser.id());
        validateReservationTime(store.getId(), request.reservationTime());

        Reservation reservation = Reservation.create(
                store,
                customer,
                request.reservationTime(),
                request.partySize(),
                request.requestNote()
        );

        return ReservationResponse.from(reservationRepository.save(reservation));
    }

    public ReservationResponse getReservation(AuthenticatedUser authenticatedUser, Long reservationId) {
        Reservation reservation = getReservationEntity(reservationId);
        validateReservationAccess(authenticatedUser, reservation);
        return ReservationResponse.from(reservation);
    }

    public List<ReservationResponse> getStoreReservations(AuthenticatedUser authenticatedUser, Long storeId) {
        Store store = getStoreEntity(storeId);
        validateStoreOwner(authenticatedUser, store);
        return reservationRepository.findAllByStoreIdOrderByReservationTimeAsc(storeId).stream()
                .map(ReservationResponse::from)
                .toList();
    }

    @Transactional
    public ReservationResponse cancelReservation(AuthenticatedUser authenticatedUser, Long reservationId) {
        Reservation reservation = getReservationEntity(reservationId);
        validateReservationCustomer(authenticatedUser, reservation);
        reservation.cancel();
        return ReservationResponse.from(reservation);
    }

    private void validateReservationTime(Long storeId, LocalDateTime reservationTime) {
        DayOfWeek dayOfWeek = reservationTime.getDayOfWeek();
        LocalTime reservationLocalTime = reservationTime.toLocalTime();

        BusinessHour businessHour = businessHourRepository.findByStoreIdAndDayOfWeek(storeId, dayOfWeek)
                .orElseThrow(() -> new BadRequestException(ErrorCode.RESERVATION_TIME_NOT_AVAILABLE));

        if (businessHour.isClosed()) {
            throw new BadRequestException(ErrorCode.RESERVATION_TIME_NOT_AVAILABLE);
        }

        if (reservationLocalTime.isBefore(businessHour.getOpenTime())
                || !reservationLocalTime.isBefore(businessHour.getCloseTime())) {
            throw new BadRequestException(ErrorCode.RESERVATION_TIME_NOT_AVAILABLE);
        }
    }

    private Store getStoreEntity(Long storeId) {
        return storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.STORE_NOT_FOUND,
                        ErrorCode.STORE_NOT_FOUND.getMessage() + " id=" + storeId
                ));
    }

    private User getCustomerEntity(Long customerId) {
        return userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.CUSTOMER_NOT_FOUND,
                        ErrorCode.CUSTOMER_NOT_FOUND.getMessage() + " id=" + customerId
                ));
    }

    private Reservation getReservationEntity(Long reservationId) {
        return reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.RESERVATION_NOT_FOUND,
                        ErrorCode.RESERVATION_NOT_FOUND.getMessage() + " id=" + reservationId
                ));
    }

    private void validateCustomerRole(AuthenticatedUser authenticatedUser) {
        if (authenticatedUser.role() != UserRole.CUSTOMER) {
            throw new ForbiddenException(ErrorCode.CUSTOMER_ROLE_REQUIRED);
        }
    }

    private void validateStoreOwner(AuthenticatedUser authenticatedUser, Store store) {
        if (authenticatedUser.role() != UserRole.OWNER) {
            throw new ForbiddenException(ErrorCode.OWNER_ROLE_REQUIRED);
        }
        if (!store.getOwner().getId().equals(authenticatedUser.id())) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN);
        }
    }

    private void validateReservationCustomer(AuthenticatedUser authenticatedUser, Reservation reservation) {
        validateCustomerRole(authenticatedUser);
        if (!reservation.getCustomer().getId().equals(authenticatedUser.id())) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN);
        }
    }

    private void validateReservationAccess(AuthenticatedUser authenticatedUser, Reservation reservation) {
        if (authenticatedUser.role() == UserRole.CUSTOMER) {
            if (!reservation.getCustomer().getId().equals(authenticatedUser.id())) {
                throw new ForbiddenException(ErrorCode.FORBIDDEN);
            }
            return;
        }

        if (authenticatedUser.role() == UserRole.OWNER
                && reservation.getStore().getOwner().getId().equals(authenticatedUser.id())) {
            return;
        }

        throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }
}
